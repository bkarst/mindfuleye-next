import { config } from 'dotenv'
// Load environment variables
config()

import { createStudent, deleteStudent, getStudent, updateStudent, getAllStudents, getStudentsBySchool } from '../model/student'

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
async function testCreateStudent() {
  const studentData = {
    schoolId: 'test-school-123',
    firstName: 'Emily',
    lastName: 'Johnson',
    dateOfBirth: '2012-03-15',
    grade: '6',
    nickname: 'Em',
    profileColor: '#FF6B6B',
    avatar: 'https://example.com/avatar.jpg',
    status: 'Active'
  }

  const student = await createStudent(studentData)

  assertNotNull(student, 'Student should be created')
  assertNotNull(student.studentId, 'Student should have an ID')
  assertEqual(student.schoolId, 'test-school-123', 'Student schoolId should match')
  assertEqual(student.firstName, 'Emily', 'Student firstName should match')
  assertEqual(student.lastName, 'Johnson', 'Student lastName should match')
  assertEqual(student.dateOfBirth, '2012-03-15', 'Student dateOfBirth should match')
  assertEqual(student.grade, '6', 'Student grade should match')
  assertEqual(student.nickname, 'Em', 'Student nickname should match')
  assertEqual(student.profileColor, '#FF6B6B', 'Student profileColor should match')
  assertEqual(student.status, 'Active', 'Student status should match')
  assertNotNull(student.createdAt, 'Student should have createdAt timestamp')
  assertNotNull(student.updatedAt, 'Student should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testStudentId = student.studentId
  ;(global as any).testStudentSchoolId = student.schoolId
  ;(global as any).testStudentGrade = student.grade
}

async function testGetStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const student = await getStudent(studentId)

  assertNotNull(student, 'Student should be retrieved')
  assertEqual(student.studentId, studentId, 'Student ID should match')
  assertEqual(student.firstName, 'Emily', 'Student firstName should match')
  assertEqual(student.lastName, 'Johnson', 'Student lastName should match')
  assertEqual(student.grade, '6', 'Student grade should match')
}

async function testUpdateStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const updateData = {
    grade: '7',
    nickname: 'Emmy',
    profileColor: '#4ECDC4'
  }

  const updatedStudent = await updateStudent(studentId, updateData)

  assertNotNull(updatedStudent, 'Updated student should be returned')
  assertEqual(updatedStudent.studentId, studentId, 'Student ID should remain the same')
  assertEqual(updatedStudent.grade, '7', 'Student grade should be updated')
  assertEqual(updatedStudent.nickname, 'Emmy', 'Student nickname should be updated')
  assertEqual(updatedStudent.profileColor, '#4ECDC4', 'Student profileColor should be updated')
  assertEqual(updatedStudent.firstName, 'Emily', 'Student firstName should remain unchanged')
  assertEqual(updatedStudent.lastName, 'Johnson', 'Student lastName should remain unchanged')
  assert(updatedStudent.updatedAt !== updatedStudent.createdAt, 'UpdatedAt should be different from createdAt')

  // Update global for later tests
  ;(global as any).testStudentGrade = updatedStudent.grade
}

async function testGetAllStudents() {
  const students = await getAllStudents()

  assertNotNull(students, 'Students array should be returned')
  assert(Array.isArray(students), 'Students should be an array')
  assert(students.length > 0, 'Students array should not be empty')

  const testStudent = students.find((s: any) => s.studentId === (global as any).testStudentId)
  assertNotNull(testStudent, 'Test student should be in the list')
}

async function testGetStudentsBySchool() {
  const schoolId = (global as any).testStudentSchoolId
  assertNotNull(schoolId, 'Test student school ID should exist from previous test')

  const students = await getStudentsBySchool(schoolId)

  assertNotNull(students, 'Students array should be returned')
  assert(Array.isArray(students), 'Students should be an array')
  assert(students.length > 0, 'Students array should not be empty')

  // All students should have the same schoolId
  for (const student of students) {
    assertEqual(student.schoolId, schoolId, 'All students should be in the same school')
  }

  const testStudent = students.find((s: any) => s.studentId === (global as any).testStudentId)
  assertNotNull(testStudent, 'Test student should be in the school list')
}

async function testGetStudentsBySchoolAndGrade() {
  const schoolId = (global as any).testStudentSchoolId
  const grade = (global as any).testStudentGrade
  assertNotNull(schoolId, 'Test student school ID should exist from previous test')
  assertNotNull(grade, 'Test student grade should exist from previous test')

  const students = await getStudentsBySchool(schoolId, grade)

  assertNotNull(students, 'Students array should be returned')
  assert(Array.isArray(students), 'Students should be an array')
  assert(students.length > 0, 'Students array should not be empty')

  // All students should have the same schoolId and grade
  for (const student of students) {
    assertEqual(student.schoolId, schoolId, 'All students should be in the same school')
    assertEqual(student.grade, grade, `All students should be in grade ${grade}`)
  }

  const testStudent = students.find((s: any) => s.studentId === (global as any).testStudentId)
  assertNotNull(testStudent, 'Test student should be in the school and grade list')
}

async function testDeleteStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const deletedStudent = await deleteStudent(studentId)

  assertNotNull(deletedStudent, 'Deleted student should be returned')
  assertEqual(deletedStudent.studentId, studentId, 'Deleted student ID should match')

  // Verify student is actually deleted
  const student = await getStudent(studentId)
  assertEqual(student, null, 'Student should not exist after deletion')
}

// Additional test: Create student with minimal data
async function testCreateStudentMinimalData() {
  const studentData = {
    schoolId: 'minimal-school-456',
    firstName: 'Alex',
    lastName: 'Smith',
    dateOfBirth: '2011-08-20',
    grade: '5'
  }

  const student = await createStudent(studentData)

  assertNotNull(student, 'Student should be created with minimal data')
  assertNotNull(student.studentId, 'Student should have an ID')
  assertEqual(student.schoolId, 'minimal-school-456', 'Student schoolId should match')
  assertEqual(student.firstName, 'Alex', 'Student firstName should match')
  assertEqual(student.lastName, 'Smith', 'Student lastName should match')
  assertEqual(student.grade, '5', 'Student grade should match')
  assertEqual(student.status, 'Active', 'Student status should default to Active')

  // Cleanup
  await deleteStudent(student.studentId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const studentData = {
    schoolId: 'partial-school-789',
    firstName: 'Taylor',
    lastName: 'Brown',
    dateOfBirth: '2013-06-10',
    grade: '4'
  }

  const student = await createStudent(studentData)
  const studentId = student.studentId

  // Update only the avatar and nickname
  const updateData = {
    avatar: 'https://example.com/new-avatar.jpg',
    nickname: 'Tay'
  }

  const updatedStudent = await updateStudent(studentId, updateData)

  assertNotNull(updatedStudent, 'Updated student should be returned')
  assertEqual(updatedStudent.avatar, 'https://example.com/new-avatar.jpg', 'Avatar should be updated')
  assertEqual(updatedStudent.nickname, 'Tay', 'Nickname should be updated')
  assertEqual(updatedStudent.firstName, 'Taylor', 'firstName should remain unchanged')
  assertEqual(updatedStudent.lastName, 'Brown', 'lastName should remain unchanged')
  assertEqual(updatedStudent.grade, '4', 'grade should remain unchanged')

  // Cleanup
  await deleteStudent(studentId)
}

// Additional test: Multiple students in same school and grade
async function testMultipleStudentsInGrade() {
  const schoolId = 'multi-school-111'
  const grade = '8'
  const createdStudents: any[] = []

  // Create 3 students in the same school and grade
  for (let i = 1; i <= 3; i++) {
    const studentData = {
      schoolId: schoolId,
      firstName: `Student${i}`,
      lastName: 'Test',
      dateOfBirth: `201${i}-01-01`,
      grade: grade
    }

    const student = await createStudent(studentData)
    createdStudents.push(student)
  }

  // Query students by school and grade
  const students = await getStudentsBySchool(schoolId, grade)

  assert(students.length >= 3, 'Should find at least 3 students in the grade')

  // Verify all created students are in the list
  for (const createdStudent of createdStudents) {
    const found = students.find((s: any) => s.studentId === createdStudent.studentId)
    assertNotNull(found, `Student ${createdStudent.firstName} should be in the list`)
  }

  // Cleanup
  for (const student of createdStudents) {
    await deleteStudent(student.studentId)
  }
}

// Additional test: Student status changes
async function testStudentStatusChanges() {
  const studentData = {
    schoolId: 'status-school-222',
    firstName: 'Jordan',
    lastName: 'Williams',
    dateOfBirth: '2010-12-05',
    grade: '9',
    status: 'Active'
  }

  const student = await createStudent(studentData)
  const studentId = student.studentId

  assertEqual(student.status, 'Active', 'Initial status should be Active')

  // Transfer student
  const transferredStudent = await updateStudent(studentId, { status: 'Transferred' })
  assertEqual(transferredStudent.status, 'Transferred', 'Status should be updated to Transferred')

  // Graduate student
  const graduatedStudent = await updateStudent(studentId, { status: 'Graduated' })
  assertEqual(graduatedStudent.status, 'Graduated', 'Status should be updated to Graduated')

  // Cleanup
  await deleteStudent(studentId)
}

// Additional test: Grade promotion
async function testGradePromotion() {
  const studentData = {
    schoolId: 'promotion-school-333',
    firstName: 'Casey',
    lastName: 'Martinez',
    dateOfBirth: '2012-04-22',
    grade: '5'
  }

  const student = await createStudent(studentData)
  const studentId = student.studentId

  assertEqual(student.grade, '5', 'Initial grade should be 5')

  // Promote to next grade
  const promotedStudent = await updateStudent(studentId, { grade: '6' })
  assertEqual(promotedStudent.grade, '6', 'Grade should be promoted to 6')

  // Verify student is no longer in grade 5
  const grade5Students = await getStudentsBySchool(studentData.schoolId, '5')
  const foundInGrade5 = grade5Students.find((s: any) => s.studentId === studentId)
  assertEqual(foundInGrade5, undefined, 'Student should not be in grade 5 anymore')

  // Verify student is now in grade 6
  const grade6Students = await getStudentsBySchool(studentData.schoolId, '6')
  const foundInGrade6 = grade6Students.find((s: any) => s.studentId === studentId)
  assertNotNull(foundInGrade6, 'Student should be in grade 6')

  // Cleanup
  await deleteStudent(studentId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Student Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Student', testCreateStudent)
  await runTest('Get Student', testGetStudent)
  await runTest('Update Student', testUpdateStudent)
  await runTest('Get All Students', testGetAllStudents)
  await runTest('Get Students By School', testGetStudentsBySchool)
  await runTest('Get Students By School And Grade', testGetStudentsBySchoolAndGrade)
  await runTest('Delete Student', testDeleteStudent)
  await runTest('Create Student with Minimal Data', testCreateStudentMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Multiple Students in Grade', testMultipleStudentsInGrade)
  await runTest('Student Status Changes', testStudentStatusChanges)
  await runTest('Grade Promotion', testGradePromotion)

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
