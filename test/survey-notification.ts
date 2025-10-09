import { config } from 'dotenv'
// Load environment variables
config()

import {
  createSurveyNotification,
  deleteSurveyNotification,
  getSurveyNotification,
  updateSurveyNotification,
  getNotificationsByParent,
  getNotificationsByScheduledDate,
  getNotificationsByStatus,
  getNotificationsByStudent,
  getNotificationsBySurveyInstance
} from '../model/survey-notification'

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
async function testCreateSurveyNotification() {
  const notificationData = {
    parentId: 'test-parent-123',
    studentId: 'test-student-456',
    surveyId: 'test-survey-789',
    surveyInstanceId: 'test-instance-111',
    scheduledDate: '2025-01-15',
    scheduledTime: '09:00',
    weekNumber: 202503,
    notificationType: 'Email',
    status: 'Scheduled',
    subject: 'Weekly Student Wellness Survey Available',
    message: 'Your weekly survey for your child is now available. Please take a few minutes to complete it.',
    templateId: 'template-001',
    metadata: JSON.stringify({ reminderSent: false })
  }

  const notification = await createSurveyNotification(notificationData)

  assertNotNull(notification, 'Notification should be created')
  assertNotNull(notification.notificationId, 'Notification should have an ID')
  assertNotNull(notification.sortKey, 'Notification should have a sortKey')
  assertEqual(notification.parentId, 'test-parent-123', 'Notification parentId should match')
  assertEqual(notification.studentId, 'test-student-456', 'Notification studentId should match')
  assertEqual(notification.surveyId, 'test-survey-789', 'Notification surveyId should match')
  assertEqual(notification.scheduledDate, '2025-01-15', 'Notification scheduledDate should match')
  assertEqual(notification.scheduledTime, '09:00', 'Notification scheduledTime should match')
  assertEqual(notification.weekNumber, 202503, 'Notification weekNumber should match')
  assertEqual(notification.status, 'Scheduled', 'Notification status should match')
  assertEqual(notification.notificationType, 'Email', 'Notification type should match')
  assertEqual(notification.attemptCount, 0, 'Initial attempt count should be 0')
  assertNotNull(notification.createdAt, 'Notification should have createdAt timestamp')
  assertNotNull(notification.updatedAt, 'Notification should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testNotificationId = notification.notificationId
  ;(global as any).testNotificationSortKey = notification.sortKey
  ;(global as any).testNotificationParentId = notification.parentId
  ;(global as any).testNotificationStudentId = notification.studentId
  ;(global as any).testNotificationScheduledDate = notification.scheduledDate
  ;(global as any).testNotificationStatus = notification.status
}

async function testGetSurveyNotification() {
  const parentId = (global as any).testNotificationParentId
  const sortKey = (global as any).testNotificationSortKey
  assertNotNull(parentId, 'Test notification parentId should exist from previous test')
  assertNotNull(sortKey, 'Test notification sortKey should exist from previous test')

  const notification = await getSurveyNotification(parentId, sortKey)

  assertNotNull(notification, 'Notification should be retrieved')
  assertEqual(notification.parentId, parentId, 'Notification parentId should match')
  assertEqual(notification.sortKey, sortKey, 'Notification sortKey should match')
  assertEqual(notification.status, 'Scheduled', 'Notification status should match')
  assertEqual(notification.studentId, 'test-student-456', 'Notification studentId should match')
}

async function testUpdateSurveyNotification() {
  const parentId = (global as any).testNotificationParentId
  const sortKey = (global as any).testNotificationSortKey
  assertNotNull(parentId, 'Test notification parentId should exist from previous test')
  assertNotNull(sortKey, 'Test notification sortKey should exist from previous test')

  const updateData = {
    status: 'Sent',
    sentAt: new Date().toISOString(),
    attemptCount: 1,
    metadata: JSON.stringify({ reminderSent: true, sentVia: 'email' })
  }

  const updatedNotification = await updateSurveyNotification(parentId, sortKey, updateData)

  assertNotNull(updatedNotification, 'Updated notification should be returned')
  assertEqual(updatedNotification.parentId, parentId, 'Notification parentId should remain the same')
  assertEqual(updatedNotification.sortKey, sortKey, 'Notification sortKey should remain the same')
  assertEqual(updatedNotification.status, 'Sent', 'Notification status should be updated')
  assertNotNull(updatedNotification.sentAt, 'SentAt should be set')
  assertEqual(updatedNotification.attemptCount, 1, 'Attempt count should be updated')
  assert(updatedNotification.updatedAt !== updatedNotification.createdAt, 'UpdatedAt should be different from createdAt')

  // Update global for later tests
  ;(global as any).testNotificationStatus = 'Sent'
}

async function testGetNotificationsByParent() {
  const parentId = (global as any).testNotificationParentId
  assertNotNull(parentId, 'Test notification parentId should exist from previous test')

  const notifications = await getNotificationsByParent(parentId)

  assertNotNull(notifications, 'Notifications array should be returned')
  assert(Array.isArray(notifications), 'Notifications should be an array')
  assert(notifications.length > 0, 'Notifications array should not be empty')

  const testNotification = notifications.find((n: any) => n.sortKey === (global as any).testNotificationSortKey)
  assertNotNull(testNotification, 'Test notification should be in the list')
  assertEqual(testNotification.parentId, parentId, 'All notifications should have the same parentId')
}

async function testGetNotificationsByScheduledDate() {
  const scheduledDate = (global as any).testNotificationScheduledDate
  assertNotNull(scheduledDate, 'Test notification scheduledDate should exist from previous test')

  const notifications = await getNotificationsByScheduledDate(scheduledDate)

  assertNotNull(notifications, 'Notifications array should be returned')
  assert(Array.isArray(notifications), 'Notifications should be an array')
  assert(notifications.length > 0, 'Notifications array should not be empty')

  // All notifications should have the same scheduledDate
  for (const notification of notifications) {
    assertEqual(notification.scheduledDate, scheduledDate, 'All notifications should have the same scheduledDate')
  }

  const testNotification = notifications.find((n: any) => n.sortKey === (global as any).testNotificationSortKey)
  assertNotNull(testNotification, 'Test notification should be in the scheduled date list')
}

async function testGetNotificationsByStatus() {
  const status = (global as any).testNotificationStatus
  assertNotNull(status, 'Test notification status should exist from previous test')

  const notifications = await getNotificationsByStatus(status)

  assertNotNull(notifications, 'Notifications array should be returned')
  assert(Array.isArray(notifications), 'Notifications should be an array')
  assert(notifications.length > 0, 'Notifications array should not be empty')

  // All notifications should have the same status
  for (const notification of notifications) {
    assertEqual(notification.status, status, `All notifications should have status: ${status}`)
  }

  const testNotification = notifications.find((n: any) => n.sortKey === (global as any).testNotificationSortKey)
  assertNotNull(testNotification, 'Test notification should be in the status list')
}

async function testGetNotificationsByStudent() {
  const studentId = (global as any).testNotificationStudentId
  assertNotNull(studentId, 'Test notification studentId should exist from previous test')

  const notifications = await getNotificationsByStudent(studentId)

  assertNotNull(notifications, 'Notifications array should be returned')
  assert(Array.isArray(notifications), 'Notifications should be an array')
  assert(notifications.length > 0, 'Notifications array should not be empty')

  // All notifications should have the same studentId
  for (const notification of notifications) {
    assertEqual(notification.studentId, studentId, 'All notifications should have the same studentId')
  }

  const testNotification = notifications.find((n: any) => n.sortKey === (global as any).testNotificationSortKey)
  assertNotNull(testNotification, 'Test notification should be in the student list')
}

async function testGetNotificationsBySurveyInstance() {
  const surveyInstanceId = 'test-instance-111'

  const notifications = await getNotificationsBySurveyInstance(surveyInstanceId)

  assertNotNull(notifications, 'Notifications array should be returned')
  assert(Array.isArray(notifications), 'Notifications should be an array')
  assert(notifications.length > 0, 'Notifications array should not be empty')

  // All notifications should have the same surveyInstanceId
  for (const notification of notifications) {
    assertEqual(notification.surveyInstanceId, surveyInstanceId, 'All notifications should have the same surveyInstanceId')
  }

  const testNotification = notifications.find((n: any) => n.sortKey === (global as any).testNotificationSortKey)
  assertNotNull(testNotification, 'Test notification should be in the survey instance list')
}

async function testDeleteSurveyNotification() {
  const parentId = (global as any).testNotificationParentId
  const sortKey = (global as any).testNotificationSortKey
  assertNotNull(parentId, 'Test notification parentId should exist from previous test')
  assertNotNull(sortKey, 'Test notification sortKey should exist from previous test')

  const deletedNotification = await deleteSurveyNotification(parentId, sortKey)

  assertNotNull(deletedNotification, 'Deleted notification should be returned')
  assertEqual(deletedNotification.parentId, parentId, 'Deleted notification parentId should match')
  assertEqual(deletedNotification.sortKey, sortKey, 'Deleted notification sortKey should match')

  // Verify notification is actually deleted
  const notification = await getSurveyNotification(parentId, sortKey)
  assertEqual(notification, null, 'Notification should not exist after deletion')
}

// Additional test: Create notification with minimal data
async function testCreateNotificationMinimalData() {
  const notificationData = {
    parentId: 'minimal-parent-999',
    studentId: 'minimal-student-888',
    surveyId: 'minimal-survey-777',
    scheduledDate: '2025-01-20',
    scheduledTime: '10:00',
    weekNumber: 202503,
    notificationType: 'SMS',
    status: 'Scheduled',
    subject: 'Survey Reminder',
    message: 'Please complete your survey.'
  }

  const notification = await createSurveyNotification(notificationData)

  assertNotNull(notification, 'Notification should be created with minimal data')
  assertNotNull(notification.notificationId, 'Notification should have an ID')
  assertEqual(notification.parentId, 'minimal-parent-999', 'Notification parentId should match')
  assertEqual(notification.status, 'Scheduled', 'Notification status should match')
  assertEqual(notification.notificationType, 'SMS', 'Notification type should match')

  // Cleanup
  await deleteSurveyNotification(notification.parentId, notification.sortKey)
}

// Additional test: Update notification to Failed status
async function testUpdateNotificationToFailed() {
  const notificationData = {
    parentId: 'failed-parent-111',
    studentId: 'failed-student-222',
    surveyId: 'failed-survey-333',
    scheduledDate: '2025-01-18',
    scheduledTime: '14:00',
    weekNumber: 202503,
    notificationType: 'Email',
    status: 'Scheduled',
    subject: 'Test Failed Notification',
    message: 'This notification will fail.'
  }

  const notification = await createSurveyNotification(notificationData)
  const { parentId, sortKey } = notification

  // Update to Failed
  const updateData = {
    status: 'Failed',
    failedAt: new Date().toISOString(),
    attemptCount: 1,
    lastError: 'Email delivery failed: Invalid email address',
    nextRetryAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  }

  const updatedNotification = await updateSurveyNotification(parentId, sortKey, updateData)

  assertEqual(updatedNotification.status, 'Failed', 'Status should be Failed')
  assertNotNull(updatedNotification.failedAt, 'FailedAt should be set')
  assertEqual(updatedNotification.attemptCount, 1, 'Attempt count should be 1')
  assertEqual(updatedNotification.lastError, 'Email delivery failed: Invalid email address', 'LastError should be set')
  assertNotNull(updatedNotification.nextRetryAt, 'NextRetryAt should be set')

  // Cleanup
  await deleteSurveyNotification(parentId, sortKey)
}

// Additional test: Update notification to Delivered status
async function testUpdateNotificationToDelivered() {
  const notificationData = {
    parentId: 'delivered-parent-444',
    studentId: 'delivered-student-555',
    surveyId: 'delivered-survey-666',
    scheduledDate: '2025-01-19',
    scheduledTime: '15:00',
    weekNumber: 202503,
    notificationType: 'Push',
    status: 'Sent',
    subject: 'Test Delivered Notification',
    message: 'This notification will be delivered.'
  }

  const notification = await createSurveyNotification(notificationData)
  const { parentId, sortKey } = notification

  // Update to Delivered
  const updateData = {
    status: 'Delivered',
    deliveredAt: new Date().toISOString(),
    attemptCount: 1
  }

  const updatedNotification = await updateSurveyNotification(parentId, sortKey, updateData)

  assertEqual(updatedNotification.status, 'Delivered', 'Status should be Delivered')
  assertNotNull(updatedNotification.deliveredAt, 'DeliveredAt should be set')

  // Cleanup
  await deleteSurveyNotification(parentId, sortKey)
}

// Additional test: Multiple notifications for same parent
async function testMultipleNotificationsForParent() {
  const parentId = 'multi-parent-777'
  const notifications: any[] = []

  // Create 3 notifications for the same parent
  for (let i = 0; i < 3; i++) {
    const notificationData = {
      parentId: parentId,
      studentId: `multi-student-${i}`,
      surveyId: `multi-survey-${i}`,
      scheduledDate: `2025-01-${15 + i}`,
      scheduledTime: '09:00',
      weekNumber: 202503,
      notificationType: 'Email',
      status: 'Scheduled',
      subject: `Survey ${i + 1}`,
      message: `Message for survey ${i + 1}`
    }

    const notification = await createSurveyNotification(notificationData)
    notifications.push(notification)
  }

  // Query all notifications for this parent
  const parentNotifications = await getNotificationsByParent(parentId)
  assert(parentNotifications.length >= 3, 'Should have at least 3 notifications for the parent')

  // Cleanup
  for (const notification of notifications) {
    await deleteSurveyNotification(notification.parentId, notification.sortKey)
  }
}

// Additional test: Different notification types
async function testDifferentNotificationTypes() {
  const types = ['Email', 'SMS', 'Push']
  const createdNotifications: any[] = []

  for (const type of types) {
    const notificationData = {
      parentId: `type-parent-${type}`,
      studentId: 'type-student-999',
      surveyId: 'type-survey-888',
      scheduledDate: '2025-01-22',
      scheduledTime: '11:00',
      weekNumber: 202504,
      notificationType: type,
      status: 'Scheduled',
      subject: `${type} Notification`,
      message: `This is a ${type} notification`
    }

    const notification = await createSurveyNotification(notificationData)
    createdNotifications.push(notification)

    assertEqual(notification.notificationType, type, `Notification type should be ${type}`)
  }

  // Cleanup
  for (const notification of createdNotifications) {
    await deleteSurveyNotification(notification.parentId, notification.sortKey)
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Survey Notification Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Survey Notification', testCreateSurveyNotification)
  await runTest('Get Survey Notification', testGetSurveyNotification)
  await runTest('Update Survey Notification', testUpdateSurveyNotification)
  await runTest('Get Notifications By Parent', testGetNotificationsByParent)
  await runTest('Get Notifications By Scheduled Date', testGetNotificationsByScheduledDate)
  await runTest('Get Notifications By Status', testGetNotificationsByStatus)
  await runTest('Get Notifications By Student', testGetNotificationsByStudent)
  await runTest('Get Notifications By Survey Instance', testGetNotificationsBySurveyInstance)
  await runTest('Delete Survey Notification', testDeleteSurveyNotification)
  await runTest('Create Notification with Minimal Data', testCreateNotificationMinimalData)
  await runTest('Update Notification to Failed', testUpdateNotificationToFailed)
  await runTest('Update Notification to Delivered', testUpdateNotificationToDelivered)
  await runTest('Multiple Notifications for Parent', testMultipleNotificationsForParent)
  await runTest('Different Notification Types', testDifferentNotificationTypes)

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
