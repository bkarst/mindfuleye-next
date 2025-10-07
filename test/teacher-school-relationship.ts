import { config } from 'dotenv'
// Load environment variables
config()

import {
  createTeacherSchoolRelationship,
  deleteTeacherSchoolRelationship,
  getTeacherSchoolRelationship,
  updateTeacherSchoolRelationship,
  getAllTeacherSchoolRelationships,
  getSchoolsByTeacher,
  getTeachersBySchool,
  getCurrentTeachersBySchool
} from '../model/teacher-school-relationship'

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
async function testCreateRelationship() {
  const relationshipData = {
    teacherId: 'test-teacher-001',
    schoolId: 'test-school-001',
    startDate: '2024-08-15',
    grades: ['9', '10', '11', '12'],
    department: 'Mathematics',
    isCurrent: true
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created')
  assertEqual(relationship.teacherId, 'test-teacher-001', 'Teacher ID should match')
  assertEqual(relationship.schoolId, 'test-school-001', 'School ID should match')
  assertEqual(relationship.startDate, '2024-08-15', 'Start date should match')
  assertArraysEqual(relationship.grades, ['9', '10', '11', '12'], 'Grades should match')
  assertEqual(relationship.department, 'Mathematics', 'Department should match')
  assertEqual(relationship.isCurrent, 'true', 'isCurrent should be "true" (string)')
  assertNotNull(relationship.createdAt, 'Relationship should have createdAt timestamp')
  assertNotNull(relationship.updatedAt, 'Relationship should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testTeacherId = relationship.teacherId
  ;(global as any).testSchoolId = relationship.schoolId
  ;(global as any).testStartDate = relationship.startDate
}

async function testGetRelationship() {
  const teacherId = (global as any).testTeacherId
  const schoolId = (global as any).testSchoolId
  const startDate = (global as any).testStartDate
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const relationship = await getTeacherSchoolRelationship(teacherId, schoolId, startDate)

  assertNotNull(relationship, 'Relationship should be retrieved')
  assertEqual(relationship.teacherId, teacherId, 'Teacher ID should match')
  assertEqual(relationship.schoolId, schoolId, 'School ID should match')
  assertEqual(relationship.startDate, startDate, 'Start date should match')
  assertEqual(relationship.department, 'Mathematics', 'Department should match')
}

async function testUpdateRelationship() {
  const teacherId = (global as any).testTeacherId
  const schoolId = (global as any).testSchoolId
  const startDate = (global as any).testStartDate
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const updateData = {
    department: 'Science',
    grades: ['9', '10', '11', '12', '13']
  }

  const updatedRelationship = await updateTeacherSchoolRelationship(teacherId, schoolId, startDate, updateData)

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertEqual(updatedRelationship.teacherId, teacherId, 'Teacher ID should remain the same')
  assertEqual(updatedRelationship.department, 'Science', 'Department should be updated')
  assertArraysEqual(updatedRelationship.grades, ['9', '10', '11', '12', '13'], 'Grades should be updated')
  assert(updatedRelationship.updatedAt !== updatedRelationship.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllRelationships() {
  const relationships = await getAllTeacherSchoolRelationships()

  assertNotNull(relationships, 'Relationships array should be returned')
  assert(Array.isArray(relationships), 'Relationships should be an array')
  assert(relationships.length > 0, 'Relationships array should not be empty')

  const testRelationship = relationships.find((r: any) => r.teacherId === (global as any).testTeacherId)
  assertNotNull(testRelationship, 'Test relationship should be in the list')
}

async function testGetSchoolsByTeacher() {
  const teacherId = (global as any).testTeacherId
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const schools = await getSchoolsByTeacher(teacherId)

  assertNotNull(schools, 'Schools array should be returned')
  assert(Array.isArray(schools), 'Schools should be an array')
  assert(schools.length > 0, 'Schools array should not be empty')

  const testSchool = schools.find((s: any) => s.schoolId === (global as any).testSchoolId)
  assertNotNull(testSchool, 'Test school should be in the list')
}

async function testGetTeachersBySchool() {
  const schoolId = (global as any).testSchoolId
  assertNotNull(schoolId, 'Test school ID should exist from previous test')

  const teachers = await getTeachersBySchool(schoolId)

  assertNotNull(teachers, 'Teachers array should be returned')
  assert(Array.isArray(teachers), 'Teachers should be an array')
  assert(teachers.length > 0, 'Teachers array should not be empty')

  const testTeacher = teachers.find((t: any) => t.teacherId === (global as any).testTeacherId)
  assertNotNull(testTeacher, 'Test teacher should be in the list')
}

async function testGetCurrentTeachersBySchool() {
  const schoolId = (global as any).testSchoolId
  assertNotNull(schoolId, 'Test school ID should exist from previous test')

  const currentTeachers = await getCurrentTeachersBySchool(schoolId)

  assertNotNull(currentTeachers, 'Current teachers array should be returned')
  assert(Array.isArray(currentTeachers), 'Current teachers should be an array')
  assert(currentTeachers.length > 0, 'Current teachers array should not be empty')

  const testTeacher = currentTeachers.find((t: any) => t.teacherId === (global as any).testTeacherId)
  assertNotNull(testTeacher, 'Test teacher should be in the list of current teachers')
  assertEqual(testTeacher.isCurrent, 'true', 'Teacher should be marked as current')
}

async function testDeleteRelationship() {
  const teacherId = (global as any).testTeacherId
  const schoolId = (global as any).testSchoolId
  const startDate = (global as any).testStartDate
  assertNotNull(teacherId, 'Test teacher ID should exist from previous test')

  const deletedRelationship = await deleteTeacherSchoolRelationship(teacherId, schoolId, startDate)

  assertNotNull(deletedRelationship, 'Deleted relationship should be returned')
  assertEqual(deletedRelationship.teacherId, teacherId, 'Deleted teacher ID should match')

  // Verify relationship is actually deleted
  const relationship = await getTeacherSchoolRelationship(teacherId, schoolId, startDate)
  assertEqual(relationship, null, 'Relationship should not exist after deletion')
}

// Additional test: Create relationship with minimal data
async function testCreateRelationshipMinimalData() {
  const relationshipData = {
    teacherId: 'test-teacher-002',
    schoolId: 'test-school-002',
    startDate: '2024-09-01'
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created with minimal data')
  assertEqual(relationship.teacherId, 'test-teacher-002', 'Teacher ID should match')
  assertEqual(relationship.schoolId, 'test-school-002', 'School ID should match')
  assertEqual(relationship.startDate, '2024-09-01', 'Start date should match')
  assertEqual(relationship.isCurrent, 'true', 'isCurrent should default to "true"')

  // Cleanup
  await deleteTeacherSchoolRelationship(relationship.teacherId, relationship.schoolId, relationship.startDate)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const relationshipData = {
    teacherId: 'test-teacher-003',
    schoolId: 'test-school-003',
    startDate: '2024-01-15',
    department: 'History'
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  // Update only the grades
  const updateData = {
    grades: ['9', '10']
  }

  const updatedRelationship = await updateTeacherSchoolRelationship(
    relationship.teacherId,
    relationship.schoolId,
    relationship.startDate,
    updateData
  )

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertArraysEqual(updatedRelationship.grades, ['9', '10'], 'Grades should be updated')
  assertEqual(updatedRelationship.department, 'History', 'Department should remain unchanged')
  assertEqual(updatedRelationship.schoolId, 'test-school-003', 'School ID should remain unchanged')

  // Cleanup
  await deleteTeacherSchoolRelationship(relationship.teacherId, relationship.schoolId, relationship.startDate)
}

// Additional test: Multiple schools per teacher
async function testMultipleSchoolsPerTeacher() {
  const teacherId = 'test-teacher-004'
  const schools = [
    { schoolId: 'test-school-004-1', startDate: '2020-08-15', endDate: '2022-06-30', isCurrent: false },
    { schoolId: 'test-school-004-2', startDate: '2022-08-15', endDate: '2023-06-30', isCurrent: false },
    { schoolId: 'test-school-004-3', startDate: '2023-08-15', isCurrent: true }
  ]

  const createdRelationships: any[] = []

  // Create all relationships
  for (const school of schools) {
    const relationship = await createTeacherSchoolRelationship({
      teacherId,
      schoolId: school.schoolId,
      startDate: school.startDate,
      endDate: school.endDate,
      isCurrent: school.isCurrent
    })
    createdRelationships.push(relationship)
  }

  // Get all schools for this teacher
  const teacherSchools = await getSchoolsByTeacher(teacherId)

  assertEqual(teacherSchools.length, 3, 'Teacher should have 3 school relationships')

  // Verify employment history
  const currentSchools = teacherSchools.filter((s: any) => s.isCurrent === 'true')
  assertEqual(currentSchools.length, 1, 'Teacher should have 1 current school')

  const pastSchools = teacherSchools.filter((s: any) => s.isCurrent === 'false')
  assertEqual(pastSchools.length, 2, 'Teacher should have 2 past schools')

  // Cleanup
  for (const rel of createdRelationships) {
    await deleteTeacherSchoolRelationship(rel.teacherId, rel.schoolId, rel.startDate)
  }
}

// Additional test: Multiple teachers per school
async function testMultipleTeachersPerSchool() {
  const schoolId = 'test-school-005'
  const teachers = [
    { teacherId: 'test-teacher-005-1', startDate: '2024-08-15', department: 'Mathematics', isCurrent: true },
    { teacherId: 'test-teacher-005-2', startDate: '2024-08-15', department: 'Science', isCurrent: true },
    { teacherId: 'test-teacher-005-3', startDate: '2024-08-15', department: 'English', isCurrent: true },
    { teacherId: 'test-teacher-005-4', startDate: '2023-08-15', endDate: '2024-06-30', department: 'History', isCurrent: false }
  ]

  const createdRelationships: any[] = []

  // Create all relationships
  for (const teacher of teachers) {
    const relationship = await createTeacherSchoolRelationship({
      teacherId: teacher.teacherId,
      schoolId,
      startDate: teacher.startDate,
      endDate: teacher.endDate,
      department: teacher.department,
      isCurrent: teacher.isCurrent
    })
    createdRelationships.push(relationship)
  }

  // Get all teachers for this school
  const schoolTeachers = await getTeachersBySchool(schoolId)

  assert(schoolTeachers.length >= 4, 'School should have at least 4 teacher relationships')

  // Get only current teachers
  const currentTeachers = await getCurrentTeachersBySchool(schoolId)

  assert(currentTeachers.length >= 3, 'School should have at least 3 current teachers')

  // Verify all current teachers have isCurrent = 'true'
  for (const teacher of currentTeachers) {
    if (createdRelationships.find((r: any) => r.teacherId === teacher.teacherId)) {
      assertEqual(teacher.isCurrent, 'true', `Teacher ${teacher.teacherId} should be marked as current`)
    }
  }

  // Cleanup
  for (const rel of createdRelationships) {
    await deleteTeacherSchoolRelationship(rel.teacherId, rel.schoolId, rel.startDate)
  }
}

// Additional test: Employment status changes
async function testEmploymentStatusChanges() {
  const relationshipData = {
    teacherId: 'test-teacher-006',
    schoolId: 'test-school-006',
    startDate: '2024-08-15',
    department: 'Art',
    isCurrent: true
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  assertEqual(relationship.isCurrent, 'true', 'Initial status should be current')

  // Mark teacher as no longer current (e.g., resigned)
  const updatedRelationship = await updateTeacherSchoolRelationship(
    relationship.teacherId,
    relationship.schoolId,
    relationship.startDate,
    {
      isCurrent: false,
      endDate: '2024-12-31'
    }
  )

  assertEqual(updatedRelationship.isCurrent, 'false', 'Status should be updated to not current')
  assertEqual(updatedRelationship.endDate, '2024-12-31', 'End date should be set')

  // Verify teacher is not in current teachers list
  const currentTeachers = await getCurrentTeachersBySchool(relationship.schoolId)
  const foundTeacher = currentTeachers.find((t: any) => t.teacherId === relationship.teacherId)
  assertEqual(foundTeacher, undefined, 'Teacher should not be in current teachers list')

  // Cleanup
  await deleteTeacherSchoolRelationship(relationship.teacherId, relationship.schoolId, relationship.startDate)
}

// Additional test: Update department
async function testUpdateDepartment() {
  const relationshipData = {
    teacherId: 'test-teacher-007',
    schoolId: 'test-school-007',
    startDate: '2024-08-15',
    department: 'Mathematics'
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  // Update department (e.g., teacher switched departments)
  const updatedRelationship = await updateTeacherSchoolRelationship(
    relationship.teacherId,
    relationship.schoolId,
    relationship.startDate,
    {
      department: 'Computer Science'
    }
  )

  assertEqual(updatedRelationship.department, 'Computer Science', 'Department should be updated')
  assertEqual(updatedRelationship.teacherId, relationship.teacherId, 'Teacher ID should remain unchanged')
  assertEqual(updatedRelationship.schoolId, relationship.schoolId, 'School ID should remain unchanged')

  // Cleanup
  await deleteTeacherSchoolRelationship(relationship.teacherId, relationship.schoolId, relationship.startDate)
}

// Additional test: Grades assignment
async function testGradesAssignment() {
  const relationshipData = {
    teacherId: 'test-teacher-008',
    schoolId: 'test-school-008',
    startDate: '2024-08-15',
    grades: ['9'],
    department: 'Science'
  }

  const relationship = await createTeacherSchoolRelationship(relationshipData)

  assertArraysEqual(relationship.grades, ['9'], 'Initial grades should be 9th grade only')

  // Update to teach more grades
  const updatedRelationship = await updateTeacherSchoolRelationship(
    relationship.teacherId,
    relationship.schoolId,
    relationship.startDate,
    {
      grades: ['9', '10', '11', '12']
    }
  )

  assertArraysEqual(updatedRelationship.grades, ['9', '10', '11', '12'], 'Grades should be updated to all high school')

  // Update to teach fewer grades
  const reducedRelationship = await updateTeacherSchoolRelationship(
    relationship.teacherId,
    relationship.schoolId,
    relationship.startDate,
    {
      grades: ['11', '12']
    }
  )

  assertArraysEqual(reducedRelationship.grades, ['11', '12'], 'Grades should be reduced to upper grades only')

  // Cleanup
  await deleteTeacherSchoolRelationship(relationship.teacherId, relationship.schoolId, relationship.startDate)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Teacher-School Relationship Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Relationship', testCreateRelationship)
  await runTest('Get Relationship', testGetRelationship)
  await runTest('Update Relationship', testUpdateRelationship)
  await runTest('Get All Relationships', testGetAllRelationships)
  await runTest('Get Schools By Teacher', testGetSchoolsByTeacher)
  await runTest('Get Teachers By School', testGetTeachersBySchool)
  await runTest('Get Current Teachers By School', testGetCurrentTeachersBySchool)
  await runTest('Delete Relationship', testDeleteRelationship)
  await runTest('Create Relationship with Minimal Data', testCreateRelationshipMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Multiple Schools Per Teacher', testMultipleSchoolsPerTeacher)
  await runTest('Multiple Teachers Per School', testMultipleTeachersPerSchool)
  await runTest('Employment Status Changes', testEmploymentStatusChanges)
  await runTest('Update Department', testUpdateDepartment)
  await runTest('Grades Assignment', testGradesAssignment)

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
