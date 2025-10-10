import { config } from 'dotenv'
// Load environment variables
config()

import { createUserSurvey, deleteUserSurvey, getUserSurvey, updateUserSurvey, getAllUserSurveys, getSurveysByParent, getParentsBySurvey, getSurveysByStudent, getSurveysByStatus } from '../model/user-survey'

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
async function testCreateUserSurvey() {
  const userSurveyData = {
    parentId: 'test-parent-123',
    surveyId: 'test-survey-456',
    studentId: 'test-student-789',
    status: 'Pending' as const,
    progress: 0
  }

  const userSurvey = await createUserSurvey(userSurveyData)

  assertNotNull(userSurvey, 'UserSurvey should be created')
  assertEqual(userSurvey.parentId, 'test-parent-123', 'ParentId should match')
  assertEqual(userSurvey.surveyId, 'test-survey-456', 'SurveyId should match')
  assertEqual(userSurvey.studentId, 'test-student-789', 'StudentId should match')
  assertEqual(userSurvey.status, 'Pending', 'Status should match')
  assertEqual(userSurvey.progress, 0, 'Progress should be 0')
  assertNotNull(userSurvey.createdAt, 'UserSurvey should have createdAt timestamp')
  assertNotNull(userSurvey.updatedAt, 'UserSurvey should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testParentId = userSurvey.parentId
  ;(global as any).testSurveyId = userSurvey.surveyId
  ;(global as any).testStudentId = userSurvey.studentId
}

async function testGetUserSurvey() {
  const parentId = (global as any).testParentId
  const surveyId = (global as any).testSurveyId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const userSurvey = await getUserSurvey(parentId, surveyId)

  assertNotNull(userSurvey, 'UserSurvey should be retrieved')
  assertEqual(userSurvey?.parentId, parentId, 'ParentId should match')
  assertEqual(userSurvey?.surveyId, surveyId, 'SurveyId should match')
  assertEqual(userSurvey?.status, 'Pending', 'Status should match')
  assertEqual(userSurvey?.studentId, 'test-student-789', 'StudentId should match')
}

async function testUpdateUserSurvey() {
  const parentId = (global as any).testParentId
  const surveyId = (global as any).testSurveyId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const updateData = {
    status: 'InProgress' as const,
    progress: 50,
    startedAt: new Date().toISOString()
  }

  const updatedUserSurvey = await updateUserSurvey(parentId, surveyId, updateData)

  assertNotNull(updatedUserSurvey, 'Updated user survey should be returned')
  assertEqual(updatedUserSurvey?.parentId, parentId, 'ParentId should remain the same')
  assertEqual(updatedUserSurvey?.surveyId, surveyId, 'SurveyId should remain the same')
  assertEqual(updatedUserSurvey?.status, 'InProgress', 'Status should be updated')
  assertEqual(updatedUserSurvey?.progress, 50, 'Progress should be updated')
  assertNotNull(updatedUserSurvey?.startedAt, 'StartedAt should be set')
  assertEqual(updatedUserSurvey?.studentId, 'test-student-789', 'StudentId should remain unchanged')
  assert(updatedUserSurvey?.updatedAt !== updatedUserSurvey?.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllUserSurveys() {
  const userSurveys = await getAllUserSurveys()

  assertNotNull(userSurveys, 'UserSurveys array should be returned')
  assert(Array.isArray(userSurveys), 'UserSurveys should be an array')
  assert(userSurveys.length > 0, 'UserSurveys array should not be empty')

  const testUserSurvey = userSurveys.find((us: any) =>
    us.parentId === (global as any).testParentId &&
    us.surveyId === (global as any).testSurveyId
  )
  assertNotNull(testUserSurvey, 'Test user survey should be in the list')
}

async function testGetSurveysByParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const userSurveys = await getSurveysByParent(parentId)

  assertNotNull(userSurveys, 'UserSurveys array should be returned')
  assert(Array.isArray(userSurveys), 'UserSurveys should be an array')
  assert(userSurveys.length > 0, 'UserSurveys array should not be empty')

  // All surveys should have the same parentId
  for (const userSurvey of userSurveys) {
    assertEqual(userSurvey.parentId, parentId, 'All surveys should have the same parentId')
  }

  const testUserSurvey = userSurveys.find((us: any) => us.surveyId === (global as any).testSurveyId)
  assertNotNull(testUserSurvey, 'Test user survey should be in the parent list')
}

async function testGetParentsBySurvey() {
  const surveyId = (global as any).testSurveyId
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const userSurveys = await getParentsBySurvey(surveyId)

  assertNotNull(userSurveys, 'UserSurveys array should be returned')
  assert(Array.isArray(userSurveys), 'UserSurveys should be an array')
  assert(userSurveys.length > 0, 'UserSurveys array should not be empty')

  // All surveys should have the same surveyId
  for (const userSurvey of userSurveys) {
    assertEqual(userSurvey.surveyId, surveyId, 'All surveys should have the same surveyId')
  }

  const testUserSurvey = userSurveys.find((us: any) => us.parentId === (global as any).testParentId)
  assertNotNull(testUserSurvey, 'Test user survey should be in the survey list')
}

async function testGetSurveysByStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const userSurveys = await getSurveysByStudent(studentId)

  assertNotNull(userSurveys, 'UserSurveys array should be returned')
  assert(Array.isArray(userSurveys), 'UserSurveys should be an array')
  assert(userSurveys.length > 0, 'UserSurveys array should not be empty')

  // All surveys should have the same studentId
  for (const userSurvey of userSurveys) {
    assertEqual(userSurvey.studentId, studentId, 'All surveys should have the same studentId')
  }

  const testUserSurvey = userSurveys.find((us: any) =>
    us.parentId === (global as any).testParentId &&
    us.surveyId === (global as any).testSurveyId
  )
  assertNotNull(testUserSurvey, 'Test user survey should be in the student list')
}

async function testGetSurveysByStatus() {
  const status = 'InProgress'

  const userSurveys = await getSurveysByStatus(status)

  assertNotNull(userSurveys, 'UserSurveys array should be returned')
  assert(Array.isArray(userSurveys), 'UserSurveys should be an array')
  assert(userSurveys.length > 0, 'UserSurveys array should not be empty')

  // All surveys should have the same status
  for (const userSurvey of userSurveys) {
    assertEqual(userSurvey.status, status, `All surveys should have status ${status}`)
  }

  const testUserSurvey = userSurveys.find((us: any) =>
    us.parentId === (global as any).testParentId &&
    us.surveyId === (global as any).testSurveyId
  )
  assertNotNull(testUserSurvey, 'Test user survey should be in the status list')
}

async function testDeleteUserSurvey() {
  const parentId = (global as any).testParentId
  const surveyId = (global as any).testSurveyId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(surveyId, 'Test survey ID should exist from previous test')

  const deletedUserSurvey = await deleteUserSurvey(parentId, surveyId)

  assertNotNull(deletedUserSurvey, 'Deleted user survey should be returned')
  assertEqual(deletedUserSurvey?.parentId, parentId, 'Deleted user survey parentId should match')
  assertEqual(deletedUserSurvey?.surveyId, surveyId, 'Deleted user survey surveyId should match')

  // Verify user survey is actually deleted
  const userSurvey = await getUserSurvey(parentId, surveyId)
  assertEqual(userSurvey, null, 'UserSurvey should not exist after deletion')
}

// Additional test: Create user survey with minimal data
async function testCreateUserSurveyMinimalData() {
  const userSurveyData = {
    parentId: 'minimal-parent-111',
    surveyId: 'minimal-survey-222',
    studentId: 'minimal-student-333',
    status: 'Pending' as const
  }

  const userSurvey = await createUserSurvey(userSurveyData)

  assertNotNull(userSurvey, 'UserSurvey should be created with minimal data')
  assertEqual(userSurvey.parentId, 'minimal-parent-111', 'ParentId should match')
  assertEqual(userSurvey.surveyId, 'minimal-survey-222', 'SurveyId should match')
  assertEqual(userSurvey.studentId, 'minimal-student-333', 'StudentId should match')
  assertEqual(userSurvey.status, 'Pending', 'Status should match')
  assertEqual(userSurvey.progress, 0, 'Progress should default to 0')

  // Cleanup
  await deleteUserSurvey(userSurvey.parentId, userSurvey.surveyId)
}

// Additional test: Update status progression
async function testStatusProgression() {
  const userSurveyData = {
    parentId: 'status-parent-444',
    surveyId: 'status-survey-555',
    studentId: 'status-student-666',
    status: 'Pending' as const
  }

  const userSurvey = await createUserSurvey(userSurveyData)
  const { parentId, surveyId } = userSurvey

  assertEqual(userSurvey.status, 'Pending', 'Initial status should be Pending')

  // Move to InProgress
  let updated = await updateUserSurvey(parentId, surveyId, {
    status: 'InProgress',
    startedAt: new Date().toISOString(),
    progress: 25
  })
  assertEqual(updated?.status, 'InProgress', 'Status should be InProgress')
  assertEqual(updated?.progress, 25, 'Progress should be 25')

  // Move to Completed
  updated = await updateUserSurvey(parentId, surveyId, {
    status: 'Completed',
    completedAt: new Date().toISOString(),
    progress: 100
  })
  assertEqual(updated?.status, 'Completed', 'Status should be Completed')
  assertEqual(updated?.progress, 100, 'Progress should be 100')
  assertNotNull(updated?.completedAt, 'CompletedAt should be set')

  // Cleanup
  await deleteUserSurvey(parentId, surveyId)
}

// Additional test: Multiple surveys for same parent
async function testMultipleSurveysForParent() {
  const parentId = 'multi-parent-777'
  const surveys = [
    { surveyId: 'survey-1', studentId: 'student-1', status: 'Pending' as const },
    { surveyId: 'survey-2', studentId: 'student-2', status: 'InProgress' as const },
    { surveyId: 'survey-3', studentId: 'student-3', status: 'Completed' as const }
  ]

  const createdSurveys: any[] = []

  for (const survey of surveys) {
    const userSurvey = await createUserSurvey({
      parentId: parentId,
      surveyId: survey.surveyId,
      studentId: survey.studentId,
      status: survey.status
    })
    createdSurveys.push(userSurvey)
  }

  // Query all surveys for this parent
  const parentSurveys = await getSurveysByParent(parentId)
  assert(parentSurveys.length >= 3, 'Parent should have at least 3 surveys')

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteUserSurvey(survey.parentId, survey.surveyId)
  }
}

// Additional test: Track survey access
async function testTrackSurveyAccess() {
  const userSurveyData = {
    parentId: 'access-parent-888',
    surveyId: 'access-survey-999',
    studentId: 'access-student-000',
    status: 'Pending' as const
  }

  const userSurvey = await createUserSurvey(userSurveyData)
  const { parentId, surveyId } = userSurvey

  // Update last accessed time
  const accessTime = new Date().toISOString()
  const updated = await updateUserSurvey(parentId, surveyId, {
    lastAccessedAt: accessTime
  })

  assertEqual(updated?.lastAccessedAt, accessTime, 'LastAccessedAt should be updated')
  assertEqual(updated?.status, 'Pending', 'Status should remain unchanged')

  // Cleanup
  await deleteUserSurvey(parentId, surveyId)
}

// Additional test: Different status values
async function testDifferentStatuses() {
  const statuses: ('Pending' | 'InProgress' | 'Completed' | 'Skipped')[] = ['Pending', 'InProgress', 'Completed', 'Skipped']
  const createdSurveys: any[] = []

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i]
    const userSurveyData = {
      parentId: `status-test-parent-${i}`,
      surveyId: `status-test-survey-${i}`,
      studentId: 'status-test-student',
      status: status
    }

    const userSurvey = await createUserSurvey(userSurveyData)
    createdSurveys.push(userSurvey)
    assertEqual(userSurvey.status, status, `Status should be ${status}`)
  }

  // Query by each status
  for (const status of statuses) {
    const statusSurveys = await getSurveysByStatus(status)
    const testSurvey = statusSurveys.find((s: any) => s.studentId === 'status-test-student' && s.status === status)
    assertNotNull(testSurvey, `Should find survey with status ${status}`)
  }

  // Cleanup
  for (const survey of createdSurveys) {
    await deleteUserSurvey(survey.parentId, survey.surveyId)
  }
}

// Additional test: Update progress increments
async function testProgressUpdates() {
  const userSurveyData = {
    parentId: 'progress-parent-123',
    surveyId: 'progress-survey-456',
    studentId: 'progress-student-789',
    status: 'InProgress' as const,
    progress: 0
  }

  const userSurvey = await createUserSurvey(userSurveyData)
  const { parentId, surveyId } = userSurvey

  assertEqual(userSurvey.progress, 0, 'Initial progress should be 0')

  // Update progress in increments
  const progressSteps = [25, 50, 75, 100]
  for (const progress of progressSteps) {
    const updated = await updateUserSurvey(parentId, surveyId, { progress })
    assertEqual(updated?.progress, progress, `Progress should be ${progress}`)
  }

  // Cleanup
  await deleteUserSurvey(parentId, surveyId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running UserSurvey Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create UserSurvey', testCreateUserSurvey)
  await runTest('Get UserSurvey', testGetUserSurvey)
  await runTest('Update UserSurvey', testUpdateUserSurvey)
  await runTest('Get All UserSurveys', testGetAllUserSurveys)
  await runTest('Get Surveys By Parent', testGetSurveysByParent)
  await runTest('Get Parents By Survey', testGetParentsBySurvey)
  await runTest('Get Surveys By Student', testGetSurveysByStudent)
  await runTest('Get Surveys By Status', testGetSurveysByStatus)
  await runTest('Delete UserSurvey', testDeleteUserSurvey)
  await runTest('Create UserSurvey with Minimal Data', testCreateUserSurveyMinimalData)
  await runTest('Status Progression', testStatusProgression)
  await runTest('Multiple Surveys for Parent', testMultipleSurveysForParent)
  await runTest('Track Survey Access', testTrackSurveyAccess)
  await runTest('Different Status Values', testDifferentStatuses)
  await runTest('Progress Updates', testProgressUpdates)

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
