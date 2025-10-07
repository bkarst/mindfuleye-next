import { config } from 'dotenv'
// Load environment variables
config()

import { createParent, deleteParent, getParent, updateParent, getAllParents, getParentByEmail } from '../model/parent'

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
async function testCreateParent() {
  const parentData = {
    email: 'test.parent@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-0123',
    role: 'Father',
    notificationEmail: true,
    notificationSms: false,
    notificationPush: true,
    weeklyReminderDay: 'Monday',
    reminderTime: '09:00',
    accountStatus: 'Active',
    lastLoginAt: new Date().toISOString()
  }

  const parent = await createParent(parentData)

  assertNotNull(parent, 'Parent should be created')
  assertNotNull(parent.parentId, 'Parent should have an ID')
  assertEqual(parent.email, 'test.parent@example.com', 'Parent email should match')
  assertEqual(parent.firstName, 'John', 'Parent firstName should match')
  assertEqual(parent.lastName, 'Doe', 'Parent lastName should match')
  assertEqual(parent.role, 'Father', 'Parent role should match')
  assertEqual(parent.notificationEmail, true, 'Parent notificationEmail should match')
  assertEqual(parent.accountStatus, 'Active', 'Parent accountStatus should match')
  assertNotNull(parent.createdAt, 'Parent should have createdAt timestamp')
  assertNotNull(parent.updatedAt, 'Parent should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testParentId = parent.parentId
  ;(global as any).testParentEmail = parent.email
}

async function testGetParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const parent = await getParent(parentId)

  assertNotNull(parent, 'Parent should be retrieved')
  assertEqual(parent.parentId, parentId, 'Parent ID should match')
  assertEqual(parent.email, 'test.parent@example.com', 'Parent email should match')
  assertEqual(parent.firstName, 'John', 'Parent firstName should match')
  assertEqual(parent.lastName, 'Doe', 'Parent lastName should match')
}

async function testUpdateParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const updateData = {
    firstName: 'Jonathan',
    phone: '555-9999',
    notificationSms: true,
    weeklyReminderDay: 'Friday'
  }

  const updatedParent = await updateParent(parentId, updateData)

  assertNotNull(updatedParent, 'Updated parent should be returned')
  assertEqual(updatedParent.parentId, parentId, 'Parent ID should remain the same')
  assertEqual(updatedParent.firstName, 'Jonathan', 'Parent firstName should be updated')
  assertEqual(updatedParent.phone, '555-9999', 'Parent phone should be updated')
  assertEqual(updatedParent.notificationSms, true, 'Parent notificationSms should be updated')
  assertEqual(updatedParent.weeklyReminderDay, 'Friday', 'Parent weeklyReminderDay should be updated')
  assertEqual(updatedParent.lastName, 'Doe', 'Parent lastName should remain unchanged')
  assertEqual(updatedParent.email, 'test.parent@example.com', 'Parent email should remain unchanged')
  assert(updatedParent.updatedAt !== updatedParent.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllParents() {
  const parents = await getAllParents()

  assertNotNull(parents, 'Parents array should be returned')
  assert(Array.isArray(parents), 'Parents should be an array')
  assert(parents.length > 0, 'Parents array should not be empty')

  const testParent = parents.find((p: any) => p.parentId === (global as any).testParentId)
  assertNotNull(testParent, 'Test parent should be in the list')
}

async function testGetParentByEmail() {
  const email = (global as any).testParentEmail
  assertNotNull(email, 'Test parent email should exist from previous test')

  const parent = await getParentByEmail(email)

  assertNotNull(parent, 'Parent should be retrieved by email')
  assertEqual(parent.email, email, 'Parent email should match')
  assertEqual(parent.parentId, (global as any).testParentId, 'Parent ID should match')
}

async function testDeleteParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const deletedParent = await deleteParent(parentId)

  assertNotNull(deletedParent, 'Deleted parent should be returned')
  assertEqual(deletedParent.parentId, parentId, 'Deleted parent ID should match')

  // Verify parent is actually deleted
  const parent = await getParent(parentId)
  assertEqual(parent, null, 'Parent should not exist after deletion')
}

// Additional test: Create parent with minimal data
async function testCreateParentMinimalData() {
  const parentData = {
    email: 'minimal@example.com',
    firstName: 'Jane',
    lastName: 'Smith'
  }

  const parent = await createParent(parentData)

  assertNotNull(parent, 'Parent should be created with minimal data')
  assertNotNull(parent.parentId, 'Parent should have an ID')
  assertEqual(parent.email, 'minimal@example.com', 'Parent email should match')
  assertEqual(parent.firstName, 'Jane', 'Parent firstName should match')
  assertEqual(parent.lastName, 'Smith', 'Parent lastName should match')
  assertEqual(parent.accountStatus, 'Active', 'Parent accountStatus should default to Active')

  // Cleanup
  await deleteParent(parent.parentId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const parentData = {
    email: 'partial@example.com',
    firstName: 'Robert',
    lastName: 'Johnson'
  }

  const parent = await createParent(parentData)
  const parentId = parent.parentId

  // Update only the notification preferences
  const updateData = {
    notificationEmail: false,
    notificationPush: true
  }

  const updatedParent = await updateParent(parentId, updateData)

  assertNotNull(updatedParent, 'Updated parent should be returned')
  assertEqual(updatedParent.notificationEmail, false, 'notificationEmail should be updated')
  assertEqual(updatedParent.notificationPush, true, 'notificationPush should be updated')
  assertEqual(updatedParent.firstName, 'Robert', 'firstName should remain unchanged')
  assertEqual(updatedParent.lastName, 'Johnson', 'lastName should remain unchanged')
  assertEqual(updatedParent.email, 'partial@example.com', 'email should remain unchanged')

  // Cleanup
  await deleteParent(parentId)
}

// Additional test: Account status changes
async function testAccountStatusChanges() {
  const parentData = {
    email: 'status@example.com',
    firstName: 'Alice',
    lastName: 'Williams',
    accountStatus: 'Active'
  }

  const parent = await createParent(parentData)
  const parentId = parent.parentId

  assertEqual(parent.accountStatus, 'Active', 'Initial status should be Active')

  // Suspend the account
  const suspendedParent = await updateParent(parentId, { accountStatus: 'Suspended' })
  assertEqual(suspendedParent.accountStatus, 'Suspended', 'Status should be updated to Suspended')

  // Reactivate the account
  const reactivatedParent = await updateParent(parentId, { accountStatus: 'Active' })
  assertEqual(reactivatedParent.accountStatus, 'Active', 'Status should be updated back to Active')

  // Cleanup
  await deleteParent(parentId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Parent Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Parent', testCreateParent)
  await runTest('Get Parent', testGetParent)
  await runTest('Update Parent', testUpdateParent)
  await runTest('Get All Parents', testGetAllParents)
  await runTest('Get Parent By Email', testGetParentByEmail)
  await runTest('Delete Parent', testDeleteParent)
  await runTest('Create Parent with Minimal Data', testCreateParentMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Account Status Changes', testAccountStatusChanges)

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
