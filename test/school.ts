import { config } from 'dotenv'
// Load environment variables
config()

import { createSchool, deleteSchool, getSchool, updateSchool, getAllSchools, getSchoolsByDistrict, getSchoolsByLevel } from '../model/school'

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
async function testCreateSchool() {
  const schoolData = {
    districtId: 'test-district-123',
    name: 'Lincoln Elementary School',
    level: 'Elementary',
    addressStreet: '456 School Lane',
    addressCity: 'Springfield',
    addressState: 'IL',
    addressZipCode: '62701',
    contactPhone: '555-4567',
    contactEmail: 'info@lincoln.edu',
    principalName: 'Dr. Sarah Johnson'
  }

  const school = await createSchool(schoolData)

  assertNotNull(school, 'School should be created')
  assertNotNull(school.schoolId, 'School should have an ID')
  assertEqual(school.districtId, 'test-district-123', 'School districtId should match')
  assertEqual(school.name, 'Lincoln Elementary School', 'School name should match')
  assertEqual(school.level, 'Elementary', 'School level should match')
  assertEqual(school.contactEmail, 'info@lincoln.edu', 'School email should match')
  assertEqual(school.principalName, 'Dr. Sarah Johnson', 'School principalName should match')
  assertNotNull(school.createdAt, 'School should have createdAt timestamp')
  assertNotNull(school.updatedAt, 'School should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testSchoolId = school.schoolId
  ;(global as any).testSchoolDistrictId = school.districtId
  ;(global as any).testSchoolLevel = school.level
}

async function testGetSchool() {
  const schoolId = (global as any).testSchoolId
  assertNotNull(schoolId, 'Test school ID should exist from previous test')

  const school = await getSchool(schoolId)

  assertNotNull(school, 'School should be retrieved')
  assertEqual(school.schoolId, schoolId, 'School ID should match')
  assertEqual(school.name, 'Lincoln Elementary School', 'School name should match')
  assertEqual(school.level, 'Elementary', 'School level should match')
  assertEqual(school.districtId, 'test-district-123', 'School districtId should match')
}

async function testUpdateSchool() {
  const schoolId = (global as any).testSchoolId
  assertNotNull(schoolId, 'Test school ID should exist from previous test')

  const updateData = {
    name: 'Lincoln Elementary & Middle School',
    contactPhone: '555-8888',
    principalName: 'Dr. Michael Brown'
  }

  const updatedSchool = await updateSchool(schoolId, updateData)

  assertNotNull(updatedSchool, 'Updated school should be returned')
  assertEqual(updatedSchool.schoolId, schoolId, 'School ID should remain the same')
  assertEqual(updatedSchool.name, 'Lincoln Elementary & Middle School', 'School name should be updated')
  assertEqual(updatedSchool.contactPhone, '555-8888', 'School phone should be updated')
  assertEqual(updatedSchool.principalName, 'Dr. Michael Brown', 'School principalName should be updated')
  assertEqual(updatedSchool.level, 'Elementary', 'School level should remain unchanged')
  assertEqual(updatedSchool.districtId, 'test-district-123', 'School districtId should remain unchanged')
  assert(updatedSchool.updatedAt !== updatedSchool.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllSchools() {
  const schools = await getAllSchools()

  assertNotNull(schools, 'Schools array should be returned')
  assert(Array.isArray(schools), 'Schools should be an array')
  assert(schools.length > 0, 'Schools array should not be empty')

  const testSchool = schools.find((s: any) => s.schoolId === (global as any).testSchoolId)
  assertNotNull(testSchool, 'Test school should be in the list')
}

async function testGetSchoolsByDistrict() {
  const districtId = (global as any).testSchoolDistrictId
  assertNotNull(districtId, 'Test school district ID should exist from previous test')

  const schools = await getSchoolsByDistrict(districtId)

  assertNotNull(schools, 'Schools array should be returned')
  assert(Array.isArray(schools), 'Schools should be an array')
  assert(schools.length > 0, 'Schools array should not be empty')

  // All schools should have the same districtId
  for (const school of schools) {
    assertEqual(school.districtId, districtId, 'All schools should be in the same district')
  }

  const testSchool = schools.find((s: any) => s.schoolId === (global as any).testSchoolId)
  assertNotNull(testSchool, 'Test school should be in the district list')
}

async function testGetSchoolsByLevel() {
  const level = (global as any).testSchoolLevel
  assertNotNull(level, 'Test school level should exist from previous test')

  const schools = await getSchoolsByLevel(level)

  assertNotNull(schools, 'Schools array should be returned')
  assert(Array.isArray(schools), 'Schools should be an array')
  assert(schools.length > 0, 'Schools array should not be empty')

  // All schools should have the same level
  for (const school of schools) {
    assertEqual(school.level, level, `All schools should be at ${level} level`)
  }

  const testSchool = schools.find((s: any) => s.schoolId === (global as any).testSchoolId)
  assertNotNull(testSchool, 'Test school should be in the level list')
}

async function testDeleteSchool() {
  const schoolId = (global as any).testSchoolId
  assertNotNull(schoolId, 'Test school ID should exist from previous test')

  const deletedSchool = await deleteSchool(schoolId)

  assertNotNull(deletedSchool, 'Deleted school should be returned')
  assertEqual(deletedSchool.schoolId, schoolId, 'Deleted school ID should match')

  // Verify school is actually deleted
  const school = await getSchool(schoolId)
  assertEqual(school, null, 'School should not exist after deletion')
}

// Additional test: Create school with minimal data
async function testCreateSchoolMinimalData() {
  const schoolData = {
    districtId: 'minimal-district-456',
    name: 'Minimal High School',
    level: 'High'
  }

  const school = await createSchool(schoolData)

  assertNotNull(school, 'School should be created with minimal data')
  assertNotNull(school.schoolId, 'School should have an ID')
  assertEqual(school.districtId, 'minimal-district-456', 'School districtId should match')
  assertEqual(school.name, 'Minimal High School', 'School name should match')
  assertEqual(school.level, 'High', 'School level should match')

  // Cleanup
  await deleteSchool(school.schoolId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const schoolData = {
    districtId: 'partial-district-789',
    name: 'Partial Middle School',
    level: 'Middle'
  }

  const school = await createSchool(schoolData)
  const schoolId = school.schoolId

  // Update only the contact information
  const updateData = {
    contactEmail: 'contact@partialmiddle.edu',
    contactPhone: '555-0000'
  }

  const updatedSchool = await updateSchool(schoolId, updateData)

  assertNotNull(updatedSchool, 'Updated school should be returned')
  assertEqual(updatedSchool.contactEmail, 'contact@partialmiddle.edu', 'Email should be updated')
  assertEqual(updatedSchool.contactPhone, '555-0000', 'Phone should be updated')
  assertEqual(updatedSchool.name, 'Partial Middle School', 'Name should remain unchanged')
  assertEqual(updatedSchool.level, 'Middle', 'Level should remain unchanged')
  assertEqual(updatedSchool.districtId, 'partial-district-789', 'DistrictId should remain unchanged')

  // Cleanup
  await deleteSchool(schoolId)
}

// Additional test: Different school levels
async function testDifferentSchoolLevels() {
  const levels = ['Elementary', 'Middle', 'High']
  const createdSchools: any[] = []

  for (const level of levels) {
    const schoolData = {
      districtId: 'levels-district-999',
      name: `Test ${level} School`,
      level: level
    }

    const school = await createSchool(schoolData)
    createdSchools.push(school)

    assertEqual(school.level, level, `School level should be ${level}`)
  }

  // Query by each level
  for (const level of levels) {
    const schools = await getSchoolsByLevel(level)
    const testSchool = schools.find((s: any) => s.districtId === 'levels-district-999' && s.level === level)
    assertNotNull(testSchool, `Should find ${level} school in query results`)
  }

  // Cleanup
  for (const school of createdSchools) {
    await deleteSchool(school.schoolId)
  }
}

// Additional test: Update principal
async function testUpdatePrincipal() {
  const schoolData = {
    districtId: 'principal-district-111',
    name: 'Principal Change School',
    level: 'Elementary',
    principalName: 'Dr. Jane Smith'
  }

  const school = await createSchool(schoolData)
  const schoolId = school.schoolId

  assertEqual(school.principalName, 'Dr. Jane Smith', 'Initial principal should be Dr. Jane Smith')

  // Change principal
  const updatedSchool = await updateSchool(schoolId, { principalName: 'Dr. Robert Lee' })
  assertEqual(updatedSchool.principalName, 'Dr. Robert Lee', 'Principal should be updated to Dr. Robert Lee')

  // Cleanup
  await deleteSchool(schoolId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running School Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create School', testCreateSchool)
  await runTest('Get School', testGetSchool)
  await runTest('Update School', testUpdateSchool)
  await runTest('Get All Schools', testGetAllSchools)
  await runTest('Get Schools By District', testGetSchoolsByDistrict)
  await runTest('Get Schools By Level', testGetSchoolsByLevel)
  await runTest('Delete School', testDeleteSchool)
  await runTest('Create School with Minimal Data', testCreateSchoolMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)
  await runTest('Different School Levels', testDifferentSchoolLevels)
  await runTest('Update Principal', testUpdatePrincipal)

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
