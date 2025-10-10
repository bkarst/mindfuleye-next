import { config } from 'dotenv'
// Load environment variables
config()

import { createSurvey, deleteSurvey, getSurvey, updateSurvey, getAllSurveys, getActiveSurveys, getSurveysByType } from '../model/survey'

// Check for required environment variables
function checkEnvironment() {
  const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    console.error('\nPlease ensure your .env file contains:')
    console.error('  - AWS_REGION')
    console.error('  - AWS_ACCESS_KEY_ID')
    console.error('  - AWS_SECRET_ACCESS_KEY')
    console.error('  - NEXT_PUBLIC_RUNTIME_ENV (development/test/production)')
    console.error('\nAlso ensure the DynamoDB tables are created in your AWS account.')
    process.exit(1)
  }

  console.log('✓ Environment variables loaded')
  console.log(`  Region: ${process.env.AWS_REGION}`)
  console.log(`  Runtime: ${process.env.NEXT_PUBLIC_RUNTIME_ENV || 'not set'}`)
  console.log('')
}

// Test utilities
let testsPassed = 0
let testsFailed = 0
const testResults: { name: string; status: 'PASSED' | 'FAILED'; error?: string }[] = []

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`)
  }
}

function assertNotNull(value: any, message: string) {
  if (value === null || value === undefined) {
    throw new Error(`${message}\nExpected value to be not null, but got: ${value}`)
  }
}

async function runTest(name: string, testFn: () => Promise<void>) {
  try {
    console.log(`\nRunning: ${name}`)
    await testFn()
    testsPassed++
    testResults.push({ name, status: 'PASSED' })
    console.log(`✓ ${name}`)
  } catch (error) {
    testsFailed++
    const errorMessage = error instanceof Error ? error.message : String(error)
    testResults.push({ name, status: 'FAILED', error: errorMessage })
    console.log(`✗ ${name}`)
    console.log(`  Error: ${errorMessage}`)
  }
}

// Test suite
async function testCreateSurvey() {
  const surveyData = {
    name: 'Weekly Student Check-in',
    grade_level: '5',
    description: 'A comprehensive weekly survey for 5th grade students',
    surveyType: 'Weekly',
    targetAudience: 'Parents',
    isActive: true,
    version: 1,
    instructions: 'Please answer all questions honestly about your child\'s week.',
    createdBy: 'test-admin-123'
  }

  const survey = await createSurvey(surveyData)

  assertNotNull(survey, 'Survey should be created')
  assertNotNull(survey.surveyId, 'Survey should have an ID')
  assertEqual(survey.name, 'Weekly Student Check-in', 'Survey name should match')
  assertEqual(survey.grade_level, '5', 'Survey grade_level should match')
  assertEqual(survey.description, 'A comprehensive weekly survey for 5th grade students', 'Survey description should match')
  assertEqual(survey.surveyType, 'Weekly', 'Survey type should match')
  assertEqual(survey.targetAudience, 'Parents', 'Survey target audience should match')
  assertEqual(survey.isActive, 'true', 'Survey should be active')
  assertEqual(survey.version, 1, 'Survey version should match')
  assertEqual(survey.instructions, 'Please answer all questions honestly about your child\'s week.', 'Survey instructions should match')
  assertEqual(survey.createdBy, 'test-admin-123', 'Survey createdBy should match')
  assertNotNull(survey.createdAt, 'Survey should have createdAt timestamp')
  assertNotNull(survey.updatedAt, 'Survey should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testSurveyId = survey.surveyId
  ;(global as any).testSurveyType = survey.surveyType
}

async function testGetSurvey() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const survey = await getSurvey(surveyId)

  assertNotNull(survey, 'Survey should be retrieved')
  assertEqual(survey?.surveyId, surveyId, 'Survey ID should match')
  assertEqual(survey?.name, 'Weekly Student Check-in', 'Survey name should match')
  assertEqual(survey?.surveyType, 'Weekly', 'Survey type should match')
  assertEqual(survey?.targetAudience, 'Parents', 'Survey target audience should match')
  assertEqual(survey?.isActive, 'true', 'Survey should be active')
}

async function testUpdateSurvey() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const updateData = {
    name: 'Weekly Student Check-in (Updated)',
    description: 'An updated comprehensive weekly survey for 5th grade students',
    version: 2,
    instructions: 'Updated instructions: Please answer all questions honestly.'
  }

  const updatedSurvey = await updateSurvey(surveyId, updateData)

  assertNotNull(updatedSurvey, 'Updated survey should be returned')
  assertEqual(updatedSurvey?.surveyId, surveyId, 'Survey ID should remain the same')
  assertEqual(updatedSurvey?.name, 'Weekly Student Check-in (Updated)', 'Survey name should be updated')
  assertEqual(updatedSurvey?.description, 'An updated comprehensive weekly survey for 5th grade students', 'Survey description should be updated')
  assertEqual(updatedSurvey?.version, 2, 'Survey version should be updated')
  assertEqual(updatedSurvey?.instructions, 'Updated instructions: Please answer all questions honestly.', 'Survey instructions should be updated')
  assertEqual(updatedSurvey?.surveyType, 'Weekly', 'Survey type should remain unchanged')
  assertEqual(updatedSurvey?.targetAudience, 'Parents', 'Survey target audience should remain unchanged')
  assert(updatedSurvey?.updatedAt !== updatedSurvey?.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllSurveys() {
  const surveys = await getAllSurveys()

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the list')
}

async function testGetActiveSurveys() {
  const surveys = await getActiveSurveys()

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  // All surveys should be active
  for (const survey of surveys) {
    assertEqual(survey.isActive, 'true', 'All surveys should be active')
  }

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the active list')
}

async function testGetActiveSurveysByType() {
  const surveyType = (global as any).testSurveyType
  assertNotNull(surveyType, 'Test survey type should exist from previous test')

  const surveys = await getActiveSurveys(surveyType)

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  // All surveys should be active and of the specified type
  for (const survey of surveys) {
    assertEqual(survey.isActive, 'true', 'All surveys should be active')
    assertEqual(survey.surveyType, surveyType, `All surveys should be of type ${surveyType}`)
  }

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the filtered list')
}

async function testGetSurveysByType() {
  const surveyType = (global as any).testSurveyType
  assertNotNull(surveyType, 'Test survey type should exist from previous test')

  const surveys = await getSurveysByType(surveyType)

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  // All surveys should have the same type
  for (const survey of surveys) {
    assertEqual(survey.surveyType, surveyType, `All surveys should be of type ${surveyType}`)
  }

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the type list')
}

async function testDeleteSurvey() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const deletedSurvey = await deleteSurvey(surveyId)

  assertNotNull(deletedSurvey, 'Deleted survey should be returned')
  assertEqual(deletedSurvey?.surveyId, surveyId, 'Deleted survey ID should match')

  // Verify survey is actually deleted
  const survey = await getSurvey(surveyId)
  assertEqual(survey, null, 'Survey should not exist after deletion')
}

// Additional test: Create survey with minimal data
async function testCreateSurveyMinimalData() {
  const surveyData = {
    name: 'Minimal Survey',
    surveyType: 'OneTime'
  }

  const survey = await createSurvey(surveyData)

  assertNotNull(survey, 'Survey should be created with minimal data')
  assertNotNull(survey.surveyId, 'Survey should have an ID')
  assertEqual(survey.name, 'Minimal Survey', 'Survey name should match')
  assertEqual(survey.surveyType, 'OneTime', 'Survey type should match')
  assertEqual(survey.isActive, 'true', 'Survey should be active by default')
  assertEqual(survey.version, 1, 'Survey version should be 1 by default')

  // Cleanup
  await deleteSurvey(survey.surveyId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const surveyData = {
    name: 'Partial Update Survey',
    surveyType: 'Monthly',
    description: 'Original description',
    isActive: true
  }

  const survey = await createSurvey(surveyData)
  const surveyId = survey.surveyId

  // Update only the description and version
  const updateData = {
    description: 'Updated description',
    version: 2
  }

  const updatedSurvey = await updateSurvey(surveyId, updateData)

  assertNotNull(updatedSurvey, 'Updated survey should be returned')
  assertEqual(updatedSurvey?.description, 'Updated description', 'Description should be updated')
  assertEqual(updatedSurvey?.version, 2, 'Version should be updated')
  assertEqual(updatedSurvey?.name, 'Partial Update Survey', 'Name should remain unchanged')
  assertEqual(updatedSurvey?.surveyType, 'Monthly', 'Type should remain unchanged')
  assertEqual(updatedSurvey?.isActive, 'true', 'Active status should remain unchanged')

  // Cleanup
  await deleteSurvey(surveyId)
}

// Additional test: Different survey types
async function testDifferentSurveyTypes() {
  const types = ['Weekly', 'Monthly', 'Quarterly', 'OneTime', 'Custom']
  const createdSurveys: any[] = []

  for (const type of types) {
    const surveyData = {
      name: `Test ${type} Survey`,
      surveyType: type,
      targetAudience: 'Parents'
    }

    const survey = await createSurvey(surveyData)
    createdSurveys.push(survey)

    assertEqual(survey.surveyType, type, `Survey type should be ${type}`)
  }

  // Query by each type
  for (const type of types) {
    const surveys = await getSurveysByType(type)
    const testSurvey = surveys.find((s: any) => s.name === `Test ${type} Survey`)
    assertNotNull(testSurvey, `Should find ${type} survey in query results`)
  }

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteSurvey(survey.surveyId)
  }
}

// Additional test: Toggle active status
async function testToggleActiveStatus() {
  const surveyData = {
    name: 'Active Status Survey',
    surveyType: 'Weekly',
    isActive: true
  }

  const survey = await createSurvey(surveyData)
  const surveyId = survey.surveyId

  assertEqual(survey.isActive, 'true', 'Initial survey should be active')

  // Deactivate survey
  const deactivatedSurvey = await updateSurvey(surveyId, { isActive: false })
  assertEqual(deactivatedSurvey?.isActive, 'false', 'Survey should be deactivated')

  // Reactivate survey
  const reactivatedSurvey = await updateSurvey(surveyId, { isActive: true })
  assertEqual(reactivatedSurvey?.isActive, 'true', 'Survey should be reactivated')

  // Cleanup
  await deleteSurvey(surveyId)
}

// Additional test: Different target audiences
async function testDifferentTargetAudiences() {
  const audiences = ['Parents', 'Teachers', 'Students']
  const createdSurveys: any[] = []

  for (const audience of audiences) {
    const surveyData = {
      name: `${audience} Survey`,
      surveyType: 'Weekly',
      targetAudience: audience
    }

    const survey = await createSurvey(surveyData)
    createdSurveys.push(survey)

    assertEqual(survey.targetAudience, audience, `Survey target audience should be ${audience}`)
  }

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteSurvey(survey.surveyId)
  }
}

// Additional test: Version incrementing
async function testVersionIncrementing() {
  const surveyData = {
    name: 'Version Test Survey',
    surveyType: 'Monthly',
    version: 1
  }

  const survey = await createSurvey(surveyData)
  const surveyId = survey.surveyId

  assertEqual(survey.version, 1, 'Initial version should be 1')

  // Increment version
  for (let i = 2; i <= 5; i++) {
    const updatedSurvey = await updateSurvey(surveyId, { version: i })
    assertEqual(updatedSurvey?.version, i, `Version should be ${i}`)
  }

  // Cleanup
  await deleteSurvey(surveyId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Survey Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Survey', testCreateSurvey)
  await runTest('Get Survey', testGetSurvey)
  await runTest('Update Survey', testUpdateSurvey)
  await runTest('Get All Surveys', testGetAllSurveys)
  await runTest('Get Active Surveys', testGetActiveSurveys)
  await runTest('Get Active Surveys By Type', testGetActiveSurveysByType)
  await runTest('Get Surveys By Type', testGetSurveysByType)
  await runTest('Delete Survey', testDeleteSurvey)
  await runTest('Create Survey with Minimal Data', testCreateSurveyMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Different Survey Types', testDifferentSurveyTypes)
  await runTest('Toggle Active Status', testToggleActiveStatus)
  await runTest('Different Target Audiences', testDifferentTargetAudiences)
  await runTest('Version Incrementing', testVersionIncrementing)

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Test Summary')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${testsPassed + testsFailed}`)
  console.log(`Passed: ${testsPassed}`)
  console.log(`Failed: ${testsFailed}`)

  if (testsFailed > 0) {
    console.log('\nFailed Tests:')
    testResults
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        console.log(`  ✗ ${result.name}`)
        if (result.error) {
          console.log(`    ${result.error}`)
        }
      })
  }

  console.log('='.repeat(60))

  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error)
  process.exit(1)
})
