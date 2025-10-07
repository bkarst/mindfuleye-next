import { config } from 'dotenv'
// Load environment variables
config()

import { createTeacher, deleteTeacher, getTeacher, updateTeacher, getAllTeachers, getTeacherByEmail } from '../model/teacher'

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
async function testCreateTeacher() {
  const teacherData = {
    firstName: 'Elizabeth',
    lastName: 'Martinez',
    email: 'elizabeth.martinez@school.edu',
    phone: '555-2001',
    subjects: ['English', 'Literature', 'Writing'],
    status: 'Active'
  }

  const teacher = await createTeacher(teacherData)

  assertNotNull(teacher, 'Teacher should be created')
  assertNotNull(teacher.teacherId, 'Teacher should have an ID')
  assertEqual(teacher.firstName, 'Elizabeth', 'Teacher firstName should match')
  assertEqual(teacher.lastName, 'Martinez', 'Teacher lastName should match')
  assertEqual(teacher.email, 'elizabeth.martinez@school.edu', 'Teacher email should match')
  assertEqual(teacher.phone, '555-2001', 'Teacher phone should match')
  assertArraysEqual(teacher.subjects, ['English', 'Literature', 'Writing'], 'Teacher subjects should match')
  assertEqual(teacher.status, 'Active', 'Teacher status should match')
  assertNotNull(teacher.createdAt, 'Teacher should have createdAt timestamp')
  assertNotNull(teacher.updatedAt, 'Teacher should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testTeacherId = teacher.teacherId
  ;(global as any).testTeacherEmail = teacher.email
}

async function testGetTeacher() {
  const teacherId = (global as any).testTeacherId
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const teacher = await getTeacher(teacherId)

  assertNotNull(teacher, 'Teacher should be retrieved')
  assertEqual(teacher.teacherId, teacherId, 'Teacher ID should match')
  assertEqual(teacher.firstName, 'Elizabeth', 'Teacher firstName should match')
  assertEqual(teacher.lastName, 'Martinez', 'Teacher lastName should match')
  assertEqual(teacher.email, 'elizabeth.martinez@school.edu', 'Teacher email should match')
}

async function testUpdateTeacher() {
  const teacherId = (global as any).testTeacherId
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const updateData = {
    phone: '555-9999',
    subjects: ['English', 'Literature', 'Writing', 'Drama'],
    email: 'e.martinez@school.edu'
  }

  const updatedTeacher = await updateTeacher(teacherId, updateData)

  assertNotNull(updatedTeacher, 'Updated teacher should be returned')
  assertEqual(updatedTeacher.teacherId, teacherId, 'Teacher ID should remain the same')
  assertEqual(updatedTeacher.phone, '555-9999', 'Teacher phone should be updated')
  assertEqual(updatedTeacher.email, 'e.martinez@school.edu', 'Teacher email should be updated')
  assertArraysEqual(updatedTeacher.subjects, ['English', 'Literature', 'Writing', 'Drama'], 'Teacher subjects should be updated')
  assertEqual(updatedTeacher.firstName, 'Elizabeth', 'Teacher firstName should remain unchanged')
  assertEqual(updatedTeacher.lastName, 'Martinez', 'Teacher lastName should remain unchanged')
  assert(updatedTeacher.updatedAt !== updatedTeacher.createdAt, 'UpdatedAt should be different from createdAt')

  // Update global email for later tests
  ;(global as any).testTeacherEmail = updatedTeacher.email
}

async function testGetAllTeachers() {
  const teachers = await getAllTeachers()

  assertNotNull(teachers, 'Teachers array should be returned')
  assert(Array.isArray(teachers), 'Teachers should be an array')
  assert(teachers.length > 0, 'Teachers array should not be empty')

  const testTeacher = teachers.find((t: any) => t.teacherId === (global as any).testTeacherId)
  assertNotNull(testTeacher, 'Test teacher should be in the list')
}

async function testGetTeacherByEmail() {
  const email = (global as any).testTeacherEmail
  assertNotNull(email, 'Test teacher email should exist from previous test')

  const teacher = await getTeacherByEmail(email)

  assertNotNull(teacher, 'Teacher should be retrieved by email')
  assertEqual(teacher.email, email, 'Teacher email should match')
  assertEqual(teacher.teacherId, (global as any).testTeacherId, 'Teacher ID should match')
}

async function testDeleteTeacher() {
  const teacherId = (global as any).testTeacherId
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const deletedTeacher = await deleteTeacher(teacherId)

  assertNotNull(deletedTeacher, 'Deleted teacher should be returned')
  assertEqual(deletedTeacher.teacherId, teacherId, 'Deleted teacher ID should match')

  // Verify teacher is actually deleted
  const teacher = await getTeacher(teacherId)
  assertEqual(teacher, null, 'Teacher should not exist after deletion')
}

// Additional test: Create teacher with minimal data
async function testCreateTeacherMinimalData() {
  const teacherData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@school.edu'
  }

  const teacher = await createTeacher(teacherData)

  assertNotNull(teacher, 'Teacher should be created with minimal data')
  assertNotNull(teacher.teacherId, 'Teacher should have an ID')
  assertEqual(teacher.firstName, 'John', 'Teacher firstName should match')
  assertEqual(teacher.lastName, 'Smith', 'Teacher lastName should match')
  assertEqual(teacher.email, 'john.smith@school.edu', 'Teacher email should match')
  assertEqual(teacher.status, 'Active', 'Teacher status should default to Active')

  // Cleanup
  await deleteTeacher(teacher.teacherId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const teacherData = {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@school.edu'
  }

  const teacher = await createTeacher(teacherData)
  const teacherId = teacher.teacherId

  // Update only the phone
  const updateData = {
    phone: '555-3333'
  }

  const updatedTeacher = await updateTeacher(teacherId, updateData)

  assertNotNull(updatedTeacher, 'Updated teacher should be returned')
  assertEqual(updatedTeacher.phone, '555-3333', 'Phone should be updated')
  assertEqual(updatedTeacher.firstName, 'Maria', 'firstName should remain unchanged')
  assertEqual(updatedTeacher.lastName, 'Garcia', 'lastName should remain unchanged')
  assertEqual(updatedTeacher.email, 'maria.garcia@school.edu', 'email should remain unchanged')

  // Cleanup
  await deleteTeacher(teacherId)
}

// Additional test: Teacher status changes
async function testTeacherStatusChanges() {
  const teacherData = {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@school.edu',
    status: 'Active'
  }

  const teacher = await createTeacher(teacherData)
  const teacherId = teacher.teacherId

  assertEqual(teacher.status, 'Active', 'Initial status should be Active')

  // Put teacher on leave
  const onLeaveTeacher = await updateTeacher(teacherId, { status: 'OnLeave' })
  assertEqual(onLeaveTeacher.status, 'OnLeave', 'Status should be updated to OnLeave')

  // Mark teacher as inactive
  const inactiveTeacher = await updateTeacher(teacherId, { status: 'Inactive' })
  assertEqual(inactiveTeacher.status, 'Inactive', 'Status should be updated to Inactive')

  // Reactivate teacher
  const activeTeacher = await updateTeacher(teacherId, { status: 'Active' })
  assertEqual(activeTeacher.status, 'Active', 'Status should be updated back to Active')

  // Cleanup
  await deleteTeacher(teacherId)
}

// Additional test: Subject management
async function testSubjectManagement() {
  const teacherData = {
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@school.edu',
    subjects: ['Mathematics']
  }

  const teacher = await createTeacher(teacherData)
  const teacherId = teacher.teacherId

  assertArraysEqual(teacher.subjects, ['Mathematics'], 'Initial subjects should be Mathematics')

  // Add more subjects
  const updatedTeacher = await updateTeacher(teacherId, {
    subjects: ['Mathematics', 'Algebra', 'Geometry']
  })
  assertArraysEqual(updatedTeacher.subjects, ['Mathematics', 'Algebra', 'Geometry'], 'Subjects should be updated')

  // Change subjects completely
  const changedTeacher = await updateTeacher(teacherId, {
    subjects: ['Calculus', 'Statistics']
  })
  assertArraysEqual(changedTeacher.subjects, ['Calculus', 'Statistics'], 'Subjects should be completely changed')

  // Cleanup
  await deleteTeacher(teacherId)
}

// Additional test: Multiple teachers with same subject
async function testMultipleTeachersWithSubject() {
  const mathTeachers = [
    {
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice.anderson@school.edu',
      subjects: ['Mathematics', 'Algebra']
    },
    {
      firstName: 'Bob',
      lastName: 'Baker',
      email: 'bob.baker@school.edu',
      subjects: ['Mathematics', 'Geometry']
    },
    {
      firstName: 'Carol',
      lastName: 'Carter',
      email: 'carol.carter@school.edu',
      subjects: ['Mathematics', 'Calculus']
    }
  ]

  const createdTeachers: any[] = []

  // Create all teachers
  for (const teacherData of mathTeachers) {
    const teacher = await createTeacher(teacherData)
    createdTeachers.push(teacher)
  }

  // Get all teachers and verify they all teach Mathematics
  const allTeachers = await getAllTeachers()

  for (const createdTeacher of createdTeachers) {
    const found = allTeachers.find((t: any) => t.teacherId === createdTeacher.teacherId)
    assertNotNull(found, `Teacher ${createdTeacher.firstName} ${createdTeacher.lastName} should be in the list`)
    assert(found.subjects.includes('Mathematics'), `${found.firstName} should teach Mathematics`)
  }

  // Cleanup
  for (const teacher of createdTeachers) {
    await deleteTeacher(teacher.teacherId)
  }
}

// Additional test: Email uniqueness check
async function testEmailLookup() {
  const teacherData = {
    firstName: 'Jennifer',
    lastName: 'Taylor',
    email: 'jennifer.taylor@school.edu',
    subjects: ['Science', 'Biology']
  }

  const teacher = await createTeacher(teacherData)

  // Lookup by email
  const foundTeacher = await getTeacherByEmail('jennifer.taylor@school.edu')

  assertNotNull(foundTeacher, 'Teacher should be found by email')
  assertEqual(foundTeacher.teacherId, teacher.teacherId, 'Teacher IDs should match')
  assertEqual(foundTeacher.firstName, 'Jennifer', 'First name should match')
  assertEqual(foundTeacher.lastName, 'Taylor', 'Last name should match')

  // Cleanup
  await deleteTeacher(teacher.teacherId)
}

// Additional test: Update name
async function testUpdateName() {
  const teacherData = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@school.edu'
  }

  const teacher = await createTeacher(teacherData)
  const teacherId = teacher.teacherId

  // Update name (e.g., after marriage)
  const updatedTeacher = await updateTeacher(teacherId, {
    lastName: 'Smith'
  })

  assertEqual(updatedTeacher.firstName, 'Jane', 'First name should remain unchanged')
  assertEqual(updatedTeacher.lastName, 'Smith', 'Last name should be updated')
  assertEqual(updatedTeacher.email, 'jane.doe@school.edu', 'Email should remain unchanged')

  // Cleanup
  await deleteTeacher(teacherId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Teacher Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Teacher', testCreateTeacher)
  await runTest('Get Teacher', testGetTeacher)
  await runTest('Update Teacher', testUpdateTeacher)
  await runTest('Get All Teachers', testGetAllTeachers)
  await runTest('Get Teacher By Email', testGetTeacherByEmail)
  await runTest('Delete Teacher', testDeleteTeacher)
  await runTest('Create Teacher with Minimal Data', testCreateTeacherMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Teacher Status Changes', testTeacherStatusChanges)
  await runTest('Subject Management', testSubjectManagement)
  await runTest('Multiple Teachers with Subject', testMultipleTeachersWithSubject)
  await runTest('Email Lookup', testEmailLookup)
  await runTest('Update Name', testUpdateName)

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
