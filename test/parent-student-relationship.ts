import { config } from 'dotenv'
// Load environment variables
config()

import {
  createParentStudentRelationship,
  deleteParentStudentRelationship,
  getParentStudentRelationship,
  updateParentStudentRelationship,
  getAllParentStudentRelationships,
  getStudentsByParent,
  getParentsByStudent
} from '../model/parent-student-relationship'

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
    parentId: 'test-parent-001',
    studentId: 'test-student-001',
    relationship: 'Mother',
    isPrimaryContact: true,
    canViewSurveys: true,
    canEditProfile: true,
    canReceiveAlerts: true
  }

  const relationship = await createParentStudentRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created')
  assertEqual(relationship.parentId, 'test-parent-001', 'Parent ID should match')
  assertEqual(relationship.studentId, 'test-student-001', 'Student ID should match')
  assertEqual(relationship.relationship, 'Mother', 'Relationship type should match')
  assertEqual(relationship.isPrimaryContact, true, 'isPrimaryContact should match')
  assertEqual(relationship.canViewSurveys, true, 'canViewSurveys should match')
  assertEqual(relationship.canEditProfile, true, 'canEditProfile should match')
  assertEqual(relationship.canReceiveAlerts, true, 'canReceiveAlerts should match')
  assertNotNull(relationship.createdAt, 'Relationship should have createdAt timestamp')
  assertNotNull(relationship.updatedAt, 'Relationship should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testParentId = relationship.parentId
  ;(global as any).testStudentId = relationship.studentId
}

async function testGetRelationship() {
  const parentId = (global as any).testParentId
  const studentId = (global as any).testStudentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const relationship = await getParentStudentRelationship(parentId, studentId)

  assertNotNull(relationship, 'Relationship should be retrieved')
  assertEqual(relationship.parentId, parentId, 'Parent ID should match')
  assertEqual(relationship.studentId, studentId, 'Student ID should match')
  assertEqual(relationship.relationship, 'Mother', 'Relationship type should match')
  assertEqual(relationship.isPrimaryContact, true, 'isPrimaryContact should match')
}

async function testUpdateRelationship() {
  const parentId = (global as any).testParentId
  const studentId = (global as any).testStudentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const updateData = {
    isPrimaryContact: false,
    canEditProfile: false,
    relationship: 'Guardian'
  }

  const updatedRelationship = await updateParentStudentRelationship(parentId, studentId, updateData)

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertEqual(updatedRelationship.parentId, parentId, 'Parent ID should remain the same')
  assertEqual(updatedRelationship.studentId, studentId, 'Student ID should remain the same')
  assertEqual(updatedRelationship.relationship, 'Guardian', 'Relationship type should be updated')
  assertEqual(updatedRelationship.isPrimaryContact, false, 'isPrimaryContact should be updated')
  assertEqual(updatedRelationship.canEditProfile, false, 'canEditProfile should be updated')
  assertEqual(updatedRelationship.canViewSurveys, true, 'canViewSurveys should remain unchanged')
  assert(updatedRelationship.updatedAt !== updatedRelationship.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllRelationships() {
  const relationships = await getAllParentStudentRelationships()

  assertNotNull(relationships, 'Relationships array should be returned')
  assert(Array.isArray(relationships), 'Relationships should be an array')
  assert(relationships.length > 0, 'Relationships array should not be empty')

  const testRelationship = relationships.find(
    (r: any) => r.parentId === (global as any).testParentId && r.studentId === (global as any).testStudentId
  )
  assertNotNull(testRelationship, 'Test relationship should be in the list')
}

async function testGetStudentsByParent() {
  const parentId = (global as any).testParentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')

  const students = await getStudentsByParent(parentId)

  assertNotNull(students, 'Students array should be returned')
  assert(Array.isArray(students), 'Students should be an array')
  assert(students.length > 0, 'Students array should not be empty')

  // All relationships should have the same parentId
  for (const student of students) {
    assertEqual(student.parentId, parentId, 'All relationships should have the same parent ID')
  }

  const testStudent = students.find((s: any) => s.studentId === (global as any).testStudentId)
  assertNotNull(testStudent, 'Test student should be in the list')
}

async function testGetParentsByStudent() {
  const studentId = (global as any).testStudentId
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const parents = await getParentsByStudent(studentId)

  assertNotNull(parents, 'Parents array should be returned')
  assert(Array.isArray(parents), 'Parents should be an array')
  assert(parents.length > 0, 'Parents array should not be empty')

  // All relationships should have the same studentId
  for (const parent of parents) {
    assertEqual(parent.studentId, studentId, 'All relationships should have the same student ID')
  }

  const testParent = parents.find((p: any) => p.parentId === (global as any).testParentId)
  assertNotNull(testParent, 'Test parent should be in the list')
}

async function testDeleteRelationship() {
  const parentId = (global as any).testParentId
  const studentId = (global as any).testStudentId
  assertNotNull(parentId, 'Test parent ID should exist from previous test')
  assertNotNull(studentId, 'Test student ID should exist from previous test')

  const deletedRelationship = await deleteParentStudentRelationship(parentId, studentId)

  assertNotNull(deletedRelationship, 'Deleted relationship should be returned')
  assertEqual(deletedRelationship.parentId, parentId, 'Deleted parent ID should match')
  assertEqual(deletedRelationship.studentId, studentId, 'Deleted student ID should match')

  // Verify relationship is actually deleted
  const relationship = await getParentStudentRelationship(parentId, studentId)
  assertEqual(relationship, null, 'Relationship should not exist after deletion')
}

// Additional test: Create relationship with minimal data and defaults
async function testCreateRelationshipWithDefaults() {
  const relationshipData = {
    parentId: 'minimal-parent-001',
    studentId: 'minimal-student-001',
    relationship: 'Father'
  }

  const relationship = await createParentStudentRelationship(relationshipData)

  assertNotNull(relationship, 'Relationship should be created with minimal data')
  assertEqual(relationship.parentId, 'minimal-parent-001', 'Parent ID should match')
  assertEqual(relationship.studentId, 'minimal-student-001', 'Student ID should match')
  assertEqual(relationship.relationship, 'Father', 'Relationship type should match')
  assertEqual(relationship.isPrimaryContact, false, 'isPrimaryContact should default to false')
  assertEqual(relationship.canViewSurveys, true, 'canViewSurveys should default to true')
  assertEqual(relationship.canEditProfile, false, 'canEditProfile should default to false')
  assertEqual(relationship.canReceiveAlerts, true, 'canReceiveAlerts should default to true')

  // Cleanup
  await deleteParentStudentRelationship(relationship.parentId, relationship.studentId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const parentId = 'partial-parent-001'
  const studentId = 'partial-student-001'

  await createParentStudentRelationship({
    parentId: parentId,
    studentId: studentId,
    relationship: 'Guardian',
    isPrimaryContact: false
  })

  // Update only permissions
  const updateData = {
    canViewSurveys: false,
    canReceiveAlerts: false
  }

  const updatedRelationship = await updateParentStudentRelationship(parentId, studentId, updateData)

  assertNotNull(updatedRelationship, 'Updated relationship should be returned')
  assertEqual(updatedRelationship.canViewSurveys, false, 'canViewSurveys should be updated')
  assertEqual(updatedRelationship.canReceiveAlerts, false, 'canReceiveAlerts should be updated')
  assertEqual(updatedRelationship.relationship, 'Guardian', 'Relationship type should remain unchanged')
  assertEqual(updatedRelationship.isPrimaryContact, false, 'isPrimaryContact should remain unchanged')

  // Cleanup
  await deleteParentStudentRelationship(parentId, studentId)
}

// Additional test: Multiple children for one parent
async function testMultipleChildrenForParent() {
  const parentId = 'multi-parent-001'
  const studentIds = ['student-001', 'student-002', 'student-003']

  // Create relationships for 3 children
  for (const studentId of studentIds) {
    await createParentStudentRelationship({
      parentId: parentId,
      studentId: studentId,
      relationship: 'Mother',
      isPrimaryContact: studentId === 'student-001' // First child is primary
    })
  }

  // Query students for this parent
  const students = await getStudentsByParent(parentId)

  assert(students.length >= 3, 'Should find at least 3 students for parent')

  // Verify all created students are in the list
  for (const studentId of studentIds) {
    const found = students.find((s: any) => s.studentId === studentId)
    assertNotNull(found, `Student ${studentId} should be in the list`)
  }

  // Verify only one is primary contact
  const primaryContacts = students.filter((s: any) => s.isPrimaryContact === true)
  assertEqual(primaryContacts.length, 1, 'Should have exactly one primary contact')
  assertEqual(primaryContacts[0].studentId, 'student-001', 'First student should be primary contact')

  // Cleanup
  for (const studentId of studentIds) {
    await deleteParentStudentRelationship(parentId, studentId)
  }
}

// Additional test: Multiple parents for one student
async function testMultipleParentsForStudent() {
  const studentId = 'multi-student-001'
  const parentIds = ['parent-001', 'parent-002']

  // Create relationships for 2 parents
  await createParentStudentRelationship({
    parentId: parentIds[0],
    studentId: studentId,
    relationship: 'Mother',
    isPrimaryContact: true
  })

  await createParentStudentRelationship({
    parentId: parentIds[1],
    studentId: studentId,
    relationship: 'Father',
    isPrimaryContact: false
  })

  // Query parents for this student
  const parents = await getParentsByStudent(studentId)

  assert(parents.length >= 2, 'Should find at least 2 parents for student')

  // Verify all created parents are in the list
  for (const parentId of parentIds) {
    const found = parents.find((p: any) => p.parentId === parentId)
    assertNotNull(found, `Parent ${parentId} should be in the list`)
  }

  // Verify relationships are correct
  const mother = parents.find((p: any) => p.parentId === parentIds[0])
  const father = parents.find((p: any) => p.parentId === parentIds[1])

  assertEqual(mother?.relationship, 'Mother', 'First parent should be Mother')
  assertEqual(father?.relationship, 'Father', 'Second parent should be Father')
  assertEqual(mother?.isPrimaryContact, true, 'Mother should be primary contact')
  assertEqual(father?.isPrimaryContact, false, 'Father should not be primary contact')

  // Cleanup
  for (const parentId of parentIds) {
    await deleteParentStudentRelationship(parentId, studentId)
  }
}

// Additional test: Primary contact transfer
async function testPrimaryContactTransfer() {
  const parentId = 'primary-parent-001'
  const studentId = 'primary-student-001'

  // Create relationship as non-primary
  await createParentStudentRelationship({
    parentId: parentId,
    studentId: studentId,
    relationship: 'Father',
    isPrimaryContact: false
  })

  let relationship = await getParentStudentRelationship(parentId, studentId)
  assertEqual(relationship?.isPrimaryContact, false, 'Should start as non-primary')

  // Transfer to primary contact
  await updateParentStudentRelationship(parentId, studentId, { isPrimaryContact: true })

  relationship = await getParentStudentRelationship(parentId, studentId)
  assertEqual(relationship?.isPrimaryContact, true, 'Should now be primary contact')

  // Cleanup
  await deleteParentStudentRelationship(parentId, studentId)
}

// Additional test: Permission management
async function testPermissionManagement() {
  const parentId = 'perm-parent-001'
  const studentId = 'perm-student-001'

  // Create relationship with all permissions enabled
  await createParentStudentRelationship({
    parentId: parentId,
    studentId: studentId,
    relationship: 'Guardian',
    canViewSurveys: true,
    canEditProfile: true,
    canReceiveAlerts: true
  })

  // Revoke all permissions
  const restrictedRelationship = await updateParentStudentRelationship(parentId, studentId, {
    canViewSurveys: false,
    canEditProfile: false,
    canReceiveAlerts: false
  })

  assertEqual(restrictedRelationship?.canViewSurveys, false, 'canViewSurveys should be revoked')
  assertEqual(restrictedRelationship?.canEditProfile, false, 'canEditProfile should be revoked')
  assertEqual(restrictedRelationship?.canReceiveAlerts, false, 'canReceiveAlerts should be revoked')

  // Re-grant specific permissions
  const updatedRelationship = await updateParentStudentRelationship(parentId, studentId, {
    canViewSurveys: true,
    canReceiveAlerts: true
  })

  assertEqual(updatedRelationship?.canViewSurveys, true, 'canViewSurveys should be granted')
  assertEqual(updatedRelationship?.canEditProfile, false, 'canEditProfile should remain revoked')
  assertEqual(updatedRelationship?.canReceiveAlerts, true, 'canReceiveAlerts should be granted')

  // Cleanup
  await deleteParentStudentRelationship(parentId, studentId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running Parent-Student Relationship Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Relationship', testCreateRelationship)
  await runTest('Get Relationship', testGetRelationship)
  await runTest('Update Relationship', testUpdateRelationship)
  await runTest('Get All Relationships', testGetAllRelationships)
  await runTest('Get Students By Parent', testGetStudentsByParent)
  await runTest('Get Parents By Student', testGetParentsByStudent)
  await runTest('Delete Relationship', testDeleteRelationship)
  await runTest('Create Relationship with Defaults', testCreateRelationshipWithDefaults)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Multiple Children for Parent', testMultipleChildrenForParent)
  await runTest('Multiple Parents for Student', testMultipleParentsForStudent)
  await runTest('Primary Contact Transfer', testPrimaryContactTransfer)
  await runTest('Permission Management', testPermissionManagement)

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
