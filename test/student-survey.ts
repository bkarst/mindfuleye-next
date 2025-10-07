import { config } from 'dotenv'
// Load environment variables
config()

import {
  createStudentSurvey,
  deleteStudentSurvey,
  getStudentSurvey,
  updateStudentSurvey,
  getAllStudentSurveys,
  getSurveysByStudent,
  getSurveyById,
  getSurveysByParent,
  getSurveysByWeek
} from '../model/student-survey'

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

function assertArraysEqual(actual: any[], expected: any[], message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`)
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
    studentId: 'test-student-001',
    parentId: 'test-parent-001',
    surveyTimestamp: '2024-10-07T12:00:00.000Z',
    weekNumber: 202441,
    academicProgressJson: JSON.stringify({ overallRating: 4, specificConcerns: [], notes: 'Doing well' }),
    contentConcernsJson: JSON.stringify({ hasIssues: false, categories: [], description: '', severity: 'None' }),
    safetyCheckJson: JSON.stringify({ physicalSafety: true, emotionalWellbeing: true, socialInteractions: true }),
    behaviorChangesJson: JSON.stringify({ observedChanges: [], concernLevel: 'None' }),
    teacherCommunicationJson: JSON.stringify({ lastContactDate: '2024-10-01', communicationQuality: 'Good', openIssues: [] }),
    actionItemsJson: JSON.stringify([]),
    completionTimeMinutes: 15,
    flags: ['completed'],
    followUpRequired: false
  }

  const survey = await createStudentSurvey(surveyData)

  assertNotNull(survey, 'Survey should be created')
  assertNotNull(survey.surveyId, 'Survey should have a surveyId')
  assertEqual(survey.studentId, 'test-student-001', 'Survey studentId should match')
  assertEqual(survey.parentId, 'test-parent-001', 'Survey parentId should match')
  assertEqual(survey.surveyTimestamp, '2024-10-07T12:00:00.000Z', 'Survey timestamp should match')
  assertEqual(survey.weekNumber, 202441, 'Survey weekNumber should match')
  assertEqual(survey.completionTimeMinutes, 15, 'Completion time should match')
  assertEqual(survey.followUpRequired, false, 'Follow up required should match')
  assertArraysEqual(survey.flags, ['completed'], 'Flags should match')
  assertNotNull(survey.createdAt, 'Survey should have createdAt timestamp')
  assertNotNull(survey.updatedAt, 'Survey should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testSurveyId = survey.surveyId
  ;(global as any).testStudentId = survey.studentId
  ;(global as any).testParentId = survey.parentId
  ;(global as any).testSurveyTimestamp = survey.surveyTimestamp
  ;(global as any).testWeekNumber = survey.weekNumber
}

async function testGetSurvey() {
  const studentId = (global as any).testStudentId
  const surveyTimestamp = (global as any).testSurveyTimestamp
  assertNotNull(studentId, 'Test student ID should exist from previous test')
  assertNotNull(surveyTimestamp, 'Test survey timestamp should exist from previous test')

  const survey = await getStudentSurvey(studentId, surveyTimestamp)

  assertNotNull(survey, 'Survey should be retrieved')
  assertEqual(survey.studentId, studentId, 'Student ID should match')
  assertEqual(survey.surveyTimestamp, surveyTimestamp, 'Survey timestamp should match')
  assertEqual(survey.weekNumber, 202441, 'Week number should match')
}

async function testUpdateSurvey() {
  const studentId = (global as any).testStudentId
  const surveyTimestamp = (global as any).testSurveyTimestamp
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const updateData = {
    completionTimeMinutes: 20,
    flags: ['completed', 'reviewed'],
    followUpRequired: true,
    academicProgressJson: JSON.stringify({ overallRating: 3, specificConcerns: ['math'], notes: 'Needs help with math' })
  }

  const updatedSurvey = await updateStudentSurvey(studentId, surveyTimestamp, updateData)

  assertNotNull(updatedSurvey, 'Updated survey should be returned')
  assertEqual(updatedSurvey.studentId, studentId, 'Student ID should remain the same')
  assertEqual(updatedSurvey.completionTimeMinutes, 20, 'Completion time should be updated')
  assertEqual(updatedSurvey.followUpRequired, true, 'Follow up required should be updated')
  assertArraysEqual(updatedSurvey.flags, ['completed', 'reviewed'], 'Flags should be updated')
  assert(updatedSurvey.updatedAt !== updatedSurvey.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllSurveys() {
  const surveys = await getAllStudentSurveys()

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the list')
}

async function testGetSurveysByStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const surveys = await getSurveysByStudent(studentId)

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the list')
}

async function testGetSurveyById() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const survey = await getSurveyById(surveyId)

  assertNotNull(survey, 'Survey should be retrieved by ID')
  assertEqual(survey.surveyId, surveyId, 'Survey ID should match')
  assertEqual(survey.studentId, (global as any).testStudentId, 'Student ID should match')
}

async function testGetSurveysByParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const surveys = await getSurveysByParent(parentId)

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the list')
}

async function testGetSurveysByWeek() {
  const weekNumber = (global as any).testWeekNumber
  assertNotNull(weekNumber, 'Test week number should exist from previous test')

  const surveys = await getSurveysByWeek(weekNumber)

  assertNotNull(surveys, 'Surveys array should be returned')
  assert(Array.isArray(surveys), 'Surveys should be an array')
  assert(surveys.length > 0, 'Surveys array should not be empty')

  const testSurvey = surveys.find((s: any) => s.surveyId === (global as any).testSurveyId)
  assertNotNull(testSurvey, 'Test survey should be in the list')
}

async function testDeleteSurvey() {
  const studentId = (global as any).testStudentId
  const surveyTimestamp = (global as any).testSurveyTimestamp
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const deletedSurvey = await deleteStudentSurvey(studentId, surveyTimestamp)

  assertNotNull(deletedSurvey, 'Deleted survey should be returned')
  assertEqual(deletedSurvey.studentId, studentId, 'Deleted student ID should match')

  // Verify survey is actually deleted
  const survey = await getStudentSurvey(studentId, surveyTimestamp)
  assertEqual(survey, null, 'Survey should not exist after deletion')
}

// Additional test: Create survey with minimal data
async function testCreateSurveyMinimalData() {
  const surveyData = {
    studentId: 'test-student-002',
    parentId: 'test-parent-002',
    surveyTimestamp: '2024-10-08T12:00:00.000Z',
    weekNumber: 202441
  }

  const survey = await createStudentSurvey(surveyData)

  assertNotNull(survey, 'Survey should be created with minimal data')
  assertNotNull(survey.surveyId, 'Survey should have a surveyId')
  assertEqual(survey.studentId, 'test-student-002', 'Student ID should match')
  assertEqual(survey.parentId, 'test-parent-002', 'Parent ID should match')
  assertEqual(survey.followUpRequired, false, 'Follow up required should default to false')
  assertArraysEqual(survey.flags, [], 'Flags should default to empty array')

  // Cleanup
  await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
}

// Additional test: Multiple surveys for same student
async function testMultipleSurveysPerStudent() {
  const studentId = 'test-student-003'
  const parentId = 'test-parent-003'
  const surveys = [
    { surveyTimestamp: '2024-10-01T12:00:00.000Z', weekNumber: 202440 },
    { surveyTimestamp: '2024-10-08T12:00:00.000Z', weekNumber: 202441 },
    { surveyTimestamp: '2024-10-15T12:00:00.000Z', weekNumber: 202442 }
  ]

  const createdSurveys: any[] = []

  // Create all surveys
  for (const surveyInfo of surveys) {
    const survey = await createStudentSurvey({
      studentId,
      parentId,
      surveyTimestamp: surveyInfo.surveyTimestamp,
      weekNumber: surveyInfo.weekNumber,
      completionTimeMinutes: 10
    })
    createdSurveys.push(survey)
  }

  // Get all surveys for this student
  const studentSurveys = await getSurveysByStudent(studentId)

  assertEqual(studentSurveys.length, 3, 'Student should have 3 surveys')

  // Verify surveys are sorted by timestamp descending (most recent first)
  assert(studentSurveys[0].surveyTimestamp >= studentSurveys[1].surveyTimestamp, 'Surveys should be sorted by timestamp descending')
  assert(studentSurveys[1].surveyTimestamp >= studentSurveys[2].surveyTimestamp, 'Surveys should be sorted by timestamp descending')

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
  }
}

// Additional test: Surveys by week
async function testSurveysGroupedByWeek() {
  const weekNumber = 202443
  const surveys = [
    { studentId: 'test-student-004', parentId: 'test-parent-004', surveyTimestamp: '2024-10-22T08:00:00.000Z' },
    { studentId: 'test-student-005', parentId: 'test-parent-005', surveyTimestamp: '2024-10-22T10:00:00.000Z' },
    { studentId: 'test-student-006', parentId: 'test-parent-006', surveyTimestamp: '2024-10-22T14:00:00.000Z' }
  ]

  const createdSurveys: any[] = []

  // Create all surveys for the same week
  for (const surveyInfo of surveys) {
    const survey = await createStudentSurvey({
      studentId: surveyInfo.studentId,
      parentId: surveyInfo.parentId,
      surveyTimestamp: surveyInfo.surveyTimestamp,
      weekNumber: weekNumber
    })
    createdSurveys.push(survey)
  }

  // Get all surveys for this week
  const weekSurveys = await getSurveysByWeek(weekNumber)

  assert(weekSurveys.length >= 3, 'Week should have at least 3 surveys')

  // Verify all surveys belong to the correct week
  for (const survey of weekSurveys) {
    if (createdSurveys.find((s: any) => s.surveyId === survey.surveyId)) {
      assertEqual(survey.weekNumber, weekNumber, `Survey ${survey.surveyId} should belong to week ${weekNumber}`)
    }
  }

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
  }
}

// Additional test: Flag management
async function testFlagManagement() {
  const surveyData = {
    studentId: 'test-student-007',
    parentId: 'test-parent-007',
    surveyTimestamp: '2024-10-09T12:00:00.000Z',
    weekNumber: 202441,
    flags: ['in-progress']
  }

  const survey = await createStudentSurvey(surveyData)

  assertArraysEqual(survey.flags, ['in-progress'], 'Initial flags should be in-progress')

  // Update to mark as completed
  const updatedSurvey = await updateStudentSurvey(survey.studentId, survey.surveyTimestamp, {
    flags: ['completed', 'reviewed']
  })

  assertArraysEqual(updatedSurvey.flags, ['completed', 'reviewed'], 'Flags should be updated')

  // Add concern flag
  const concernSurvey = await updateStudentSurvey(survey.studentId, survey.surveyTimestamp, {
    flags: ['completed', 'reviewed', 'concern'],
    followUpRequired: true
  })

  assertArraysEqual(concernSurvey.flags, ['completed', 'reviewed', 'concern'], 'Concern flag should be added')
  assertEqual(concernSurvey.followUpRequired, true, 'Follow up should be required')

  // Cleanup
  await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
}

// Additional test: Follow-up required
async function testFollowUpRequired() {
  const surveyData = {
    studentId: 'test-student-008',
    parentId: 'test-parent-008',
    surveyTimestamp: '2024-10-10T12:00:00.000Z',
    weekNumber: 202441,
    followUpRequired: false
  }

  const survey = await createStudentSurvey(surveyData)

  assertEqual(survey.followUpRequired, false, 'Initial follow up should be false')

  // Mark as requiring follow up
  const updatedSurvey = await updateStudentSurvey(survey.studentId, survey.surveyTimestamp, {
    followUpRequired: true,
    flags: ['concern', 'follow-up-needed']
  })

  assertEqual(updatedSurvey.followUpRequired, true, 'Follow up should be required')

  // Cleanup
  await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
}

// Additional test: Update JSON fields
async function testUpdateJsonFields() {
  const surveyData = {
    studentId: 'test-student-009',
    parentId: 'test-parent-009',
    surveyTimestamp: '2024-10-11T12:00:00.000Z',
    weekNumber: 202441,
    academicProgressJson: JSON.stringify({ overallRating: 5, specificConcerns: [], notes: 'Excellent' }),
    safetyCheckJson: JSON.stringify({ physicalSafety: true, emotionalWellbeing: true, socialInteractions: true })
  }

  const survey = await createStudentSurvey(surveyData)

  // Update academic progress
  const updatedSurvey = await updateStudentSurvey(survey.studentId, survey.surveyTimestamp, {
    academicProgressJson: JSON.stringify({ overallRating: 4, specificConcerns: ['homework completion'], notes: 'Good but needs to complete homework' }),
    behaviorChangesJson: JSON.stringify({ observedChanges: ['more quiet'], concernLevel: 'Low' })
  })

  assertNotNull(updatedSurvey.academicProgressJson, 'Academic progress JSON should be updated')
  assertNotNull(updatedSurvey.behaviorChangesJson, 'Behavior changes JSON should be added')

  // Cleanup
  await deleteStudentSurvey(survey.studentId, survey.surveyTimestamp)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Student Survey Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Survey', testCreateSurvey)
  await runTest('Get Survey', testGetSurvey)
  await runTest('Update Survey', testUpdateSurvey)
  await runTest('Get All Surveys', testGetAllSurveys)
  await runTest('Get Surveys By Student', testGetSurveysByStudent)
  await runTest('Get Survey By ID', testGetSurveyById)
  await runTest('Get Surveys By Parent', testGetSurveysByParent)
  await runTest('Get Surveys By Week', testGetSurveysByWeek)
  await runTest('Delete Survey', testDeleteSurvey)
  await runTest('Create Survey with Minimal Data', testCreateSurveyMinimalData)
  await runTest('Multiple Surveys Per Student', testMultipleSurveysPerStudent)
  await runTest('Surveys Grouped By Week', testSurveysGroupedByWeek)
  await runTest('Flag Management', testFlagManagement)
  await runTest('Follow Up Required', testFollowUpRequired)
  await runTest('Update JSON Fields', testUpdateJsonFields)

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
