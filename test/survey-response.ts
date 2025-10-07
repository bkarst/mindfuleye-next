import { config } from 'dotenv'
// Load environment variables
config()

import {
  createSurveyResponse,
  deleteSurveyResponse,
  getSurveyResponse,
  updateSurveyResponse,
  getAllSurveyResponses,
  getResponsesBySurvey,
  getResponsesByStudent,
  getResponsesByCategory,
  getResponsesByConcernLevel
} from '../model/survey-response'

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
async function testCreateResponse() {
  const responseData = {
    surveyId: 'test-survey-001',
    questionId: 'q001',
    studentId: 'test-student-001',
    parentId: 'test-parent-001',
    questionText: 'How is your child performing academically?',
    questionCategory: 'Academic',
    responseType: 'Scale',
    responseValue: '4',
    responseNumeric: 4,
    concernLevel: 'None',
    requiresFollowUp: false,
    notes: 'Student is doing well',
    answeredAt: '2024-10-07T12:00:00.000Z'
  }

  const response = await createSurveyResponse(responseData)

  assertNotNull(response, 'Response should be created')
  assertEqual(response.surveyId, 'test-survey-001', 'Survey ID should match')
  assertEqual(response.questionId, 'q001', 'Question ID should match')
  assertEqual(response.studentId, 'test-student-001', 'Student ID should match')
  assertEqual(response.parentId, 'test-parent-001', 'Parent ID should match')
  assertEqual(response.questionText, 'How is your child performing academically?', 'Question text should match')
  assertEqual(response.questionCategory, 'Academic', 'Question category should match')
  assertEqual(response.responseType, 'Scale', 'Response type should match')
  assertEqual(response.responseValue, '4', 'Response value should match')
  assertEqual(response.responseNumeric, 4, 'Response numeric should match')
  assertEqual(response.concernLevel, 'None', 'Concern level should match')
  assertEqual(response.requiresFollowUp, false, 'Requires follow up should match')
  assertNotNull(response.createdAt, 'Response should have createdAt timestamp')
  assertNotNull(response.updatedAt, 'Response should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testSurveyId = response.surveyId
  ;(global as any).testQuestionId = response.questionId
  ;(global as any).testStudentId = response.studentId
  ;(global as any).testQuestionCategory = response.questionCategory
}

async function testGetResponse() {
  const surveyId = (global as any).testSurveyId
  const questionId = (global as any).testQuestionId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')
  assertNotNull(questionId, 'Test question ID should exist from previous test')

  const response = await getSurveyResponse(surveyId, questionId)

  assertNotNull(response, 'Response should be retrieved')
  assertEqual(response.surveyId, surveyId, 'Survey ID should match')
  assertEqual(response.questionId, questionId, 'Question ID should match')
  assertEqual(response.questionCategory, 'Academic', 'Question category should match')
}

async function testUpdateResponse() {
  const surveyId = (global as any).testSurveyId
  const questionId = (global as any).testQuestionId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const updateData = {
    responseValue: '3',
    responseNumeric: 3,
    concernLevel: 'Low',
    requiresFollowUp: true,
    notes: 'Student needs some additional support in math'
  }

  const updatedResponse = await updateSurveyResponse(surveyId, questionId, updateData)

  assertNotNull(updatedResponse, 'Updated response should be returned')
  assertEqual(updatedResponse.surveyId, surveyId, 'Survey ID should remain the same')
  assertEqual(updatedResponse.responseValue, '3', 'Response value should be updated')
  assertEqual(updatedResponse.responseNumeric, 3, 'Response numeric should be updated')
  assertEqual(updatedResponse.concernLevel, 'Low', 'Concern level should be updated')
  assertEqual(updatedResponse.requiresFollowUp, true, 'Requires follow up should be updated')
  assert(updatedResponse.updatedAt !== updatedResponse.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllResponses() {
  const responses = await getAllSurveyResponses()

  assertNotNull(responses, 'Responses array should be returned')
  assert(Array.isArray(responses), 'Responses should be an array')
  assert(responses.length > 0, 'Responses array should not be empty')

  const testResponse = responses.find((r: any) => r.surveyId === (global as any).testSurveyId)
  assertNotNull(testResponse, 'Test response should be in the list')
}

async function testGetResponsesBySurvey() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const responses = await getResponsesBySurvey(surveyId)

  assertNotNull(responses, 'Responses array should be returned')
  assert(Array.isArray(responses), 'Responses should be an array')
  assert(responses.length > 0, 'Responses array should not be empty')

  const testResponse = responses.find((r: any) => r.questionId === (global as any).testQuestionId)
  assertNotNull(testResponse, 'Test response should be in the list')
}

async function testGetResponsesByStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const responses = await getResponsesByStudent(studentId)

  assertNotNull(responses, 'Responses array should be returned')
  assert(Array.isArray(responses), 'Responses should be an array')
  assert(responses.length > 0, 'Responses array should not be empty')

  const testResponse = responses.find((r: any) => r.surveyId === (global as any).testSurveyId)
  assertNotNull(testResponse, 'Test response should be in the list')
}

async function testGetResponsesByCategory() {
  const questionCategory = (global as any).testQuestionCategory
  assertNotNull(questionCategory, 'Test question category should exist from previous test')

  const responses = await getResponsesByCategory(questionCategory)

  assertNotNull(responses, 'Responses array should be returned')
  assert(Array.isArray(responses), 'Responses should be an array')
  assert(responses.length > 0, 'Responses array should not be empty')

  const testResponse = responses.find((r: any) => r.surveyId === (global as any).testSurveyId)
  assertNotNull(testResponse, 'Test response should be in the list')
}

async function testGetResponsesByConcernLevel() {
  const concernLevel = 'Low'

  const responses = await getResponsesByConcernLevel(concernLevel)

  assertNotNull(responses, 'Responses array should be returned')
  assert(Array.isArray(responses), 'Responses should be an array')
  assert(responses.length > 0, 'Responses array should not be empty')

  const testResponse = responses.find((r: any) => r.surveyId === (global as any).testSurveyId)
  assertNotNull(testResponse, 'Test response should be in the list')
}

async function testDeleteResponse() {
  const surveyId = (global as any).testSurveyId
  const questionId = (global as any).testQuestionId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const deletedResponse = await deleteSurveyResponse(surveyId, questionId)

  assertNotNull(deletedResponse, 'Deleted response should be returned')
  assertEqual(deletedResponse.surveyId, surveyId, 'Deleted survey ID should match')

  // Verify response is actually deleted
  const response = await getSurveyResponse(surveyId, questionId)
  assertEqual(response, null, 'Response should not exist after deletion')
}

// Additional test: Create response with minimal data
async function testCreateResponseMinimalData() {
  const responseData = {
    surveyId: 'test-survey-002',
    questionId: 'q002',
    studentId: 'test-student-002',
    parentId: 'test-parent-002',
    questionText: 'Does your child feel safe at school?',
    questionCategory: 'Safety',
    responseType: 'Boolean',
    responseValue: 'true',
    responseBoolean: true,
    answeredAt: '2024-10-08T12:00:00.000Z'
  }

  const response = await createSurveyResponse(responseData)

  assertNotNull(response, 'Response should be created with minimal data')
  assertEqual(response.surveyId, 'test-survey-002', 'Survey ID should match')
  assertEqual(response.questionId, 'q002', 'Question ID should match')
  assertEqual(response.concernLevel, 'None', 'Concern level should default to None')
  assertEqual(response.requiresFollowUp, false, 'Requires follow up should default to false')

  // Cleanup
  await deleteSurveyResponse(response.surveyId, response.questionId)
}

// Additional test: Multiple responses for same survey
async function testMultipleResponsesPerSurvey() {
  const surveyId = 'test-survey-003'
  const responses = [
    { questionId: 'q003-1', questionText: 'Academic progress?', questionCategory: 'Academic', responseValue: '4', responseNumeric: 4 },
    { questionId: 'q003-2', questionText: 'Social interactions?', questionCategory: 'Social', responseValue: '5', responseNumeric: 5 },
    { questionId: 'q003-3', questionText: 'Behavior concerns?', questionCategory: 'Behavioral', responseValue: '3', responseNumeric: 3 }
  ]

  const createdResponses: any[] = []

  // Create all responses
  for (const resp of responses) {
    const response = await createSurveyResponse({
      surveyId,
      questionId: resp.questionId,
      studentId: 'test-student-003',
      parentId: 'test-parent-003',
      questionText: resp.questionText,
      questionCategory: resp.questionCategory,
      responseType: 'Scale',
      responseValue: resp.responseValue,
      responseNumeric: resp.responseNumeric,
      answeredAt: '2024-10-09T12:00:00.000Z'
    })
    createdResponses.push(response)
  }

  // Get all responses for this survey
  const surveyResponses = await getResponsesBySurvey(surveyId)

  assertEqual(surveyResponses.length, 3, 'Survey should have 3 responses')

  // Verify all categories are represented
  const categories = surveyResponses.map((r: any) => r.questionCategory)
  assert(categories.includes('Academic'), 'Should have Academic response')
  assert(categories.includes('Social'), 'Should have Social response')
  assert(categories.includes('Behavioral'), 'Should have Behavioral response')

  // Cleanup
  for (const resp of createdResponses) {
    await deleteSurveyResponse(resp.surveyId, resp.questionId)
  }
}

// Additional test: Responses by category
async function testResponsesByCategory() {
  const category = 'Safety'
  const responses = [
    { surveyId: 'test-survey-004', questionId: 'q004-1', studentId: 'test-student-004' },
    { surveyId: 'test-survey-005', questionId: 'q005-1', studentId: 'test-student-005' },
    { surveyId: 'test-survey-006', questionId: 'q006-1', studentId: 'test-student-006' }
  ]

  const createdResponses: any[] = []

  // Create all safety-related responses
  for (const resp of responses) {
    const response = await createSurveyResponse({
      surveyId: resp.surveyId,
      questionId: resp.questionId,
      studentId: resp.studentId,
      parentId: 'test-parent-004',
      questionText: 'Does your child feel safe?',
      questionCategory: category,
      responseType: 'Boolean',
      responseValue: 'true',
      responseBoolean: true,
      answeredAt: '2024-10-10T12:00:00.000Z'
    })
    createdResponses.push(response)
  }

  // Get all safety responses
  const safetyResponses = await getResponsesByCategory(category)

  assert(safetyResponses.length >= 3, 'Should have at least 3 safety responses')

  // Verify all are safety category
  for (const response of safetyResponses) {
    if (createdResponses.find((r: any) => r.surveyId === response.surveyId)) {
      assertEqual(response.questionCategory, category, `Response should be ${category} category`)
    }
  }

  // Cleanup
  for (const resp of createdResponses) {
    await deleteSurveyResponse(resp.surveyId, resp.questionId)
  }
}

// Additional test: Concern level escalation
async function testConcernLevelEscalation() {
  const responseData = {
    surveyId: 'test-survey-007',
    questionId: 'q007',
    studentId: 'test-student-007',
    parentId: 'test-parent-007',
    questionText: 'Any behavioral concerns?',
    questionCategory: 'Behavioral',
    responseType: 'Text',
    responseValue: 'Some minor issues',
    concernLevel: 'None',
    requiresFollowUp: false,
    answeredAt: '2024-10-11T12:00:00.000Z'
  }

  const response = await createSurveyResponse(responseData)

  assertEqual(response.concernLevel, 'None', 'Initial concern level should be None')

  // Escalate to Low
  const lowConcern = await updateSurveyResponse(response.surveyId, response.questionId, {
    concernLevel: 'Low',
    notes: 'Parent reported minor classroom disturbances'
  })

  assertEqual(lowConcern.concernLevel, 'Low', 'Concern level should be Low')

  // Escalate to High
  const highConcern = await updateSurveyResponse(response.surveyId, response.questionId, {
    concernLevel: 'High',
    requiresFollowUp: true,
    notes: 'Multiple incidents reported, needs intervention'
  })

  assertEqual(highConcern.concernLevel, 'High', 'Concern level should be High')
  assertEqual(highConcern.requiresFollowUp, true, 'Should require follow up')

  // Cleanup
  await deleteSurveyResponse(response.surveyId, response.questionId)
}

// Additional test: Different response types
async function testDifferentResponseTypes() {
  const surveyId = 'test-survey-008'
  const responses = [
    { questionId: 'q008-1', responseType: 'Text', responseValue: 'Great progress', responseNumeric: undefined, responseBoolean: undefined },
    { questionId: 'q008-2', responseType: 'Number', responseValue: '85', responseNumeric: 85, responseBoolean: undefined },
    { questionId: 'q008-3', responseType: 'Boolean', responseValue: 'true', responseNumeric: undefined, responseBoolean: true },
    { questionId: 'q008-4', responseType: 'Scale', responseValue: '4', responseNumeric: 4, responseBoolean: undefined }
  ]

  const createdResponses: any[] = []

  // Create responses with different types
  for (const resp of responses) {
    const response = await createSurveyResponse({
      surveyId,
      questionId: resp.questionId,
      studentId: 'test-student-008',
      parentId: 'test-parent-008',
      questionText: 'Test question',
      questionCategory: 'Academic',
      responseType: resp.responseType,
      responseValue: resp.responseValue,
      responseNumeric: resp.responseNumeric,
      responseBoolean: resp.responseBoolean,
      answeredAt: '2024-10-12T12:00:00.000Z'
    })
    createdResponses.push(response)
  }

  // Verify all response types
  const surveyResponses = await getResponsesBySurvey(surveyId)

  assertEqual(surveyResponses.length, 4, 'Should have 4 responses')

  const textResponse = surveyResponses.find((r: any) => r.responseType === 'Text')
  assertNotNull(textResponse, 'Should have Text response')
  assertEqual(textResponse.responseValue, 'Great progress', 'Text response value should match')

  const numberResponse = surveyResponses.find((r: any) => r.responseType === 'Number')
  assertNotNull(numberResponse, 'Should have Number response')
  assertEqual(numberResponse.responseNumeric, 85, 'Number response numeric should match')

  const booleanResponse = surveyResponses.find((r: any) => r.responseType === 'Boolean')
  assertNotNull(booleanResponse, 'Should have Boolean response')
  assertEqual(booleanResponse.responseBoolean, true, 'Boolean response boolean should match')

  const scaleResponse = surveyResponses.find((r: any) => r.responseType === 'Scale')
  assertNotNull(scaleResponse, 'Should have Scale response')
  assertEqual(scaleResponse.responseNumeric, 4, 'Scale response numeric should match')

  // Cleanup
  for (const resp of createdResponses) {
    await deleteSurveyResponse(resp.surveyId, resp.questionId)
  }
}

// Additional test: Critical concern responses
async function testCriticalConcernResponses() {
  const concernLevels = ['Critical', 'High', 'Medium']
  const createdResponses: any[] = []

  for (let i = 0; i < concernLevels.length; i++) {
    const response = await createSurveyResponse({
      surveyId: `test-survey-009-${i}`,
      questionId: `q009-${i}`,
      studentId: 'test-student-009',
      parentId: 'test-parent-009',
      questionText: 'Safety concern question',
      questionCategory: 'Safety',
      responseType: 'Text',
      responseValue: 'Issue reported',
      concernLevel: concernLevels[i],
      requiresFollowUp: true,
      answeredAt: '2024-10-13T12:00:00.000Z'
    })
    createdResponses.push(response)
  }

  // Get critical concerns
  const criticalResponses = await getResponsesByConcernLevel('Critical')

  assert(criticalResponses.length >= 1, 'Should have at least 1 critical response')

  const testCritical = criticalResponses.find((r: any) => r.surveyId === 'test-survey-009-0')
  assertNotNull(testCritical, 'Test critical response should be in the list')
  assertEqual(testCritical.concernLevel, 'Critical', 'Should be Critical concern level')
  assertEqual(testCritical.requiresFollowUp, true, 'Should require follow up')

  // Cleanup
  for (const resp of createdResponses) {
    await deleteSurveyResponse(resp.surveyId, resp.questionId)
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Survey Response Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Response', testCreateResponse)
  await runTest('Get Response', testGetResponse)
  await runTest('Update Response', testUpdateResponse)
  await runTest('Get All Responses', testGetAllResponses)
  await runTest('Get Responses By Survey', testGetResponsesBySurvey)
  await runTest('Get Responses By Student', testGetResponsesByStudent)
  await runTest('Get Responses By Category', testGetResponsesByCategory)
  await runTest('Get Responses By Concern Level', testGetResponsesByConcernLevel)
  await runTest('Delete Response', testDeleteResponse)
  await runTest('Create Response with Minimal Data', testCreateResponseMinimalData)
  await runTest('Multiple Responses Per Survey', testMultipleResponsesPerSurvey)
  await runTest('Responses By Category', testResponsesByCategory)
  await runTest('Concern Level Escalation', testConcernLevelEscalation)
  await runTest('Different Response Types', testDifferentResponseTypes)
  await runTest('Critical Concern Responses', testCriticalConcernResponses)

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
