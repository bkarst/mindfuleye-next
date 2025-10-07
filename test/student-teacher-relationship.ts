import { config } from 'dotenv'
// Load environment variables
config()

import {
  createStudentTeacherRelationship,
  deleteStudentTeacherRelationship,
  getStudentTeacherRelationship,
  updateStudentTeacherRelationship,
  getAllStudentTeacherRelationships,
  getTeachersByStudent,
  getStudentsByTeacher,
  getCurrentAssignments
} from '../model/student-teacher-relationship'

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
async function testCreateRelationship() {
  const relationshipData = {
    studentId: 'test-student-001',
    teacherId: 'test-teacher-001',
    academicYear: '2024-2025',
    subject: 'Mathematics',
    gradeLevel: '9',
    startDate: '2024-08-15',
    isCurrent: true
  }

  const relationship = await createStudentTeacherRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created')
  assertEqual(relationship.studentId, 'test-student-001', 'Student ID should match')
  assertEqual(relationship.teacherId, 'test-teacher-001', 'Teacher ID should match')
  assertEqual(relationship.academicYear, '2024-2025', 'Academic year should match')
  assertEqual(relationship.subject, 'Mathematics', 'Subject should match')
  assertEqual(relationship.gradeLevel, '9', 'Grade level should match')
  assertEqual(relationship.startDate, '2024-08-15', 'Start date should match')
  assertEqual(relationship.isCurrent, 'true', 'isCurrent should be "true" (string)')
  assertNotNull(relationship.createdAt, 'Relationship should have createdAt timestamp')
  assertNotNull(relationship.updatedAt, 'Relationship should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testStudentId = relationship.studentId
  ;(global as any).testTeacherId = relationship.teacherId
  ;(global as any).testAcademicYear = relationship.academicYear
}

async function testGetRelationship() {
  const studentId = (global as any).testStudentId
  const teacherId = (global as any).testTeacherId
  const academicYear = (global as any).testAcademicYear
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const relationship = await getStudentTeacherRelationship(studentId, teacherId, academicYear)

  assertNotNull(relationship, 'Relationship should be retrieved')
  assertEqual(relationship.studentId, studentId, 'Student ID should match')
  assertEqual(relationship.teacherId, teacherId, 'Teacher ID should match')
  assertEqual(relationship.academicYear, academicYear, 'Academic year should match')
  assertEqual(relationship.subject, 'Mathematics', 'Subject should match')
}

async function testUpdateRelationship() {
  const studentId = (global as any).testStudentId
  const teacherId = (global as any).testTeacherId
  const academicYear = (global as any).testAcademicYear
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const updateData = {
    subject: 'Advanced Mathematics',
    gradeLevel: '10'
  }

  const updatedRelationship = await updateStudentTeacherRelationship(studentId, teacherId, academicYear, updateData)

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertEqual(updatedRelationship.studentId, studentId, 'Student ID should remain the same')
  assertEqual(updatedRelationship.subject, 'Advanced Mathematics', 'Subject should be updated')
  assertEqual(updatedRelationship.gradeLevel, '10', 'Grade level should be updated')
  assert(updatedRelationship.updatedAt !== updatedRelationship.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllRelationships() {
  const relationships = await getAllStudentTeacherRelationships()

  assertNotNull(relationships, 'Relationships array should be returned')
  assert(Array.isArray(relationships), 'Relationships should be an array')
  assert(relationships.length > 0, 'Relationships array should not be empty')

  const testRelationship = relationships.find((r: any) => r.studentId === (global as any).testStudentId)
  assertNotNull(testRelationship, 'Test relationship should be in the list')
}

async function testGetTeachersByStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const teachers = await getTeachersByStudent(studentId)

  assertNotNull(teachers, 'Teachers array should be returned')
  assert(Array.isArray(teachers), 'Teachers should be an array')
  assert(teachers.length > 0, 'Teachers array should not be empty')

  const testTeacher = teachers.find((t: any) => t.teacherId === (global as any).testTeacherId)
  assertNotNull(testTeacher, 'Test teacher should be in the list')
}

async function testGetStudentsByTeacher() {
  const teacherId = (global as any).testTeacherId
  const academicYear = (global as any).testAcademicYear
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const students = await getStudentsByTeacher(teacherId, academicYear)

  assertNotNull(students, 'Students array should be returned')
  assert(Array.isArray(students), 'Students should be an array')
  assert(students.length > 0, 'Students array should not be empty')

  const testStudent = students.find((s: any) => s.studentId === (global as any).testStudentId)
  assertNotNull(testStudent, 'Test student should be in the list')
}

async function testGetCurrentAssignments() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const currentAssignments = await getCurrentAssignments(studentId)

  assertNotNull(currentAssignments, 'Current assignments array should be returned')
  assert(Array.isArray(currentAssignments), 'Current assignments should be an array')
  assert(currentAssignments.length > 0, 'Current assignments array should not be empty')

  const testAssignment = currentAssignments.find((a: any) => a.teacherId === (global as any).testTeacherId)
  assertNotNull(testAssignment, 'Test assignment should be in the list of current assignments')
  assertEqual(testAssignment.isCurrent, 'true', 'Assignment should be marked as current')
}

async function testDeleteRelationship() {
  const studentId = (global as any).testStudentId
  const teacherId = (global as any).testTeacherId
  const academicYear = (global as any).testAcademicYear
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const deletedRelationship = await deleteStudentTeacherRelationship(studentId, teacherId, academicYear)

  assertNotNull(deletedRelationship, 'Deleted relationship should be returned')
  assertEqual(deletedRelationship.studentId, studentId, 'Deleted student ID should match')

  // Verify relationship is actually deleted
  const relationship = await getStudentTeacherRelationship(studentId, teacherId, academicYear)
  assertEqual(relationship, null, 'Relationship should not exist after deletion')
}

// Additional test: Create relationship with minimal data
async function testCreateRelationshipMinimalData() {
  const relationshipData = {
    studentId: 'test-student-002',
    teacherId: 'test-teacher-002',
    academicYear: '2024-2025',
    startDate: '2024-08-15'
  }

  const relationship = await createStudentTeacherRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created with minimal data')
  assertEqual(relationship.studentId, 'test-student-002', 'Student ID should match')
  assertEqual(relationship.teacherId, 'test-teacher-002', 'Teacher ID should match')
  assertEqual(relationship.academicYear, '2024-2025', 'Academic year should match')
  assertEqual(relationship.isCurrent, 'true', 'isCurrent should default to "true"')

  // Cleanup
  await deleteStudentTeacherRelationship(relationship.studentId, relationship.teacherId, relationship.academicYear)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const relationshipData = {
    studentId: 'test-student-003',
    teacherId: 'test-teacher-003',
    academicYear: '2024-2025',
    subject: 'English',
    startDate: '2024-08-15'
  }

  const relationship = await createStudentTeacherRelationship(relationshipData)

  // Update only the grade level
  const updateData = {
    gradeLevel: '11'
  }

  const updatedRelationship = await updateStudentTeacherRelationship(
    relationship.studentId,
    relationship.teacherId,
    relationship.academicYear,
    updateData
  )

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertEqual(updatedRelationship.gradeLevel, '11', 'Grade level should be updated')
  assertEqual(updatedRelationship.subject, 'English', 'Subject should remain unchanged')
  assertEqual(updatedRelationship.studentId, 'test-student-003', 'Student ID should remain unchanged')

  // Cleanup
  await deleteStudentTeacherRelationship(relationship.studentId, relationship.teacherId, relationship.academicYear)
}

// Additional test: Multiple teachers per student
async function testMultipleTeachersPerStudent() {
  const studentId = 'test-student-004'
  const teachers = [
    { teacherId: 'test-teacher-004-1', academicYear: '2024-2025', subject: 'Mathematics', startDate: '2024-08-15', isCurrent: true },
    { teacherId: 'test-teacher-004-2', academicYear: '2024-2025', subject: 'English', startDate: '2024-08-15', isCurrent: true },
    { teacherId: 'test-teacher-004-3', academicYear: '2024-2025', subject: 'Science', startDate: '2024-08-15', isCurrent: true },
    { teacherId: 'test-teacher-004-4', academicYear: '2023-2024', subject: 'History', startDate: '2023-08-15', endDate: '2024-06-30', isCurrent: false }
  ]

  const createdRelationships: any[] = []

  // Create all relationships
  for (const teacher of teachers) {
    const relationship = await createStudentTeacherRelationship({
      studentId,
      teacherId: teacher.teacherId,
      academicYear: teacher.academicYear,
      subject: teacher.subject,
      startDate: teacher.startDate,
      endDate: teacher.endDate,
      isCurrent: teacher.isCurrent
    })
    createdRelationships.push(relationship)
  }

  // Get all teachers for this student
  const studentTeachers = await getTeachersByStudent(studentId)

  assertEqual(studentTeachers.length, 4, 'Student should have 4 teacher relationships')

  // Verify current vs past assignments
  const currentTeachers = studentTeachers.filter((t: any) => t.isCurrent === 'true')
  assertEqual(currentTeachers.length, 3, 'Student should have 3 current teachers')

  const pastTeachers = studentTeachers.filter((t: any) => t.isCurrent === 'false')
  assertEqual(pastTeachers.length, 1, 'Student should have 1 past teacher')

  // Cleanup
  for (const rel of createdRelationships) {
    await deleteStudentTeacherRelationship(rel.studentId, rel.teacherId, rel.academicYear)
  }
}

// Additional test: Multiple students per teacher in same year
async function testMultipleStudentsPerTeacher() {
  const teacherId = 'test-teacher-005'
  const academicYear = '2024-2025'
  const students = [
    { studentId: 'test-student-005-1', subject: 'Mathematics', gradeLevel: '9', startDate: '2024-08-15', isCurrent: true },
    { studentId: 'test-student-005-2', subject: 'Mathematics', gradeLevel: '9', startDate: '2024-08-15', isCurrent: true },
    { studentId: 'test-student-005-3', subject: 'Mathematics', gradeLevel: '10', startDate: '2024-08-15', isCurrent: true }
  ]

  const createdRelationships: any[] = []

  // Create all relationships
  for (const student of students) {
    const relationship = await createStudentTeacherRelationship({
      studentId: student.studentId,
      teacherId,
      academicYear,
      subject: student.subject,
      gradeLevel: student.gradeLevel,
      startDate: student.startDate,
      isCurrent: student.isCurrent
    })
    createdRelationships.push(relationship)
  }

  // Get all students for this teacher in this year
  const teacherStudents = await getStudentsByTeacher(teacherId, academicYear)

  assert(teacherStudents.length >= 3, 'Teacher should have at least 3 students in 2024-2025')

  // Verify all have same academic year
  for (const student of teacherStudents) {
    if (createdRelationships.find((r: any) => r.studentId === student.studentId)) {
      assertEqual(student.academicYear, academicYear, `Student ${student.studentId} should be in ${academicYear}`)
    }
  }

  // Cleanup
  for (const rel of createdRelationships) {
    await deleteStudentTeacherRelationship(rel.studentId, rel.teacherId, rel.academicYear)
  }
}

// Additional test: Student progression through academic years
async function testStudentAcademicYearProgression() {
  const studentId = 'test-student-006'
  const teacherId = 'test-teacher-006'
  const years = [
    { academicYear: '2022-2023', gradeLevel: '9', startDate: '2022-08-15', endDate: '2023-06-30', isCurrent: false },
    { academicYear: '2023-2024', gradeLevel: '10', startDate: '2023-08-15', endDate: '2024-06-30', isCurrent: false },
    { academicYear: '2024-2025', gradeLevel: '11', startDate: '2024-08-15', isCurrent: true }
  ]

  const createdRelationships: any[] = []

  // Create relationships for each year
  for (const year of years) {
    const relationship = await createStudentTeacherRelationship({
      studentId,
      teacherId,
      academicYear: year.academicYear,
      subject: 'Mathematics',
      gradeLevel: year.gradeLevel,
      startDate: year.startDate,
      endDate: year.endDate,
      isCurrent: year.isCurrent
    })
    createdRelationships.push(relationship)
  }

  // Get all teachers for this student (should show progression)
  const studentTeachers = await getTeachersByStudent(studentId)

  assertEqual(studentTeachers.length, 3, 'Student should have 3 year relationships with teacher')

  // Verify current year
  const currentYear = studentTeachers.find((t: any) => t.isCurrent === 'true')
  assertNotNull(currentYear, 'Student should have a current year assignment')
  assertEqual(currentYear.academicYear, '2024-2025', 'Current year should be 2024-2025')
  assertEqual(currentYear.gradeLevel, '11', 'Current grade should be 11')

  // Cleanup
  for (const rel of createdRelationships) {
    await deleteStudentTeacherRelationship(rel.studentId, rel.teacherId, rel.academicYear)
  }
}

// Additional test: Assignment status changes
async function testAssignmentStatusChanges() {
  const relationshipData = {
    studentId: 'test-student-007',
    teacherId: 'test-teacher-007',
    academicYear: '2024-2025',
    subject: 'Science',
    startDate: '2024-08-15',
    isCurrent: true
  }

  const relationship = await createStudentTeacherRelationship(relationshipData)

  assertEqual(relationship.isCurrent, 'true', 'Initial status should be current')

  // Mark assignment as completed (e.g., end of school year)
  const updatedRelationship = await updateStudentTeacherRelationship(
    relationship.studentId,
    relationship.teacherId,
    relationship.academicYear,
    {
      isCurrent: false,
      endDate: '2025-06-30'
    }
  )

  assertEqual(updatedRelationship.isCurrent, 'false', 'Status should be updated to not current')
  assertEqual(updatedRelationship.endDate, '2025-06-30', 'End date should be set')

  // Note: Skipping GSI query check here due to eventual consistency in DynamoDB GSIs
  // The update is successful, but the GSI may not reflect the change immediately

  // Cleanup
  await deleteStudentTeacherRelationship(relationship.studentId, relationship.teacherId, relationship.academicYear)
}

// Additional test: Subject changes
async function testSubjectChanges() {
  const relationshipData = {
    studentId: 'test-student-008',
    teacherId: 'test-teacher-008',
    academicYear: '2024-2025',
    subject: 'Algebra I',
    startDate: '2024-08-15'
  }

  const relationship = await createStudentTeacherRelationship(relationshipData)

  assertEqual(relationship.subject, 'Algebra I', 'Initial subject should be Algebra I')

  // Update subject (e.g., course change)
  const updatedRelationship = await updateStudentTeacherRelationship(
    relationship.studentId,
    relationship.teacherId,
    relationship.academicYear,
    {
      subject: 'Geometry'
    }
  )

  assertEqual(updatedRelationship.subject, 'Geometry', 'Subject should be updated to Geometry')

  // Cleanup
  await deleteStudentTeacherRelationship(relationship.studentId, relationship.teacherId, relationship.academicYear)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Student-Teacher Relationship Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Relationship', testCreateRelationship)
  await runTest('Get Relationship', testGetRelationship)
  await runTest('Update Relationship', testUpdateRelationship)
  await runTest('Get All Relationships', testGetAllRelationships)
  await runTest('Get Teachers By Student', testGetTeachersByStudent)
  await runTest('Get Students By Teacher', testGetStudentsByTeacher)
  await runTest('Get Current Assignments', testGetCurrentAssignments)
  await runTest('Delete Relationship', testDeleteRelationship)
  await runTest('Create Relationship with Minimal Data', testCreateRelationshipMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Multiple Teachers Per Student', testMultipleTeachersPerStudent)
  await runTest('Multiple Students Per Teacher', testMultipleStudentsPerTeacher)
  await runTest('Student Academic Year Progression', testStudentAcademicYearProgression)
  await runTest('Assignment Status Changes', testAssignmentStatusChanges)
  await runTest('Subject Changes', testSubjectChanges)

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
