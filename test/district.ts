import { config } from 'dotenv'
// Load environment variables
config()

import { createDistrict, deleteDistrict, getDistrict, updateDistrict, getAllDistricts, getDistrictsByState } from '../model/district'

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
async function testCreateDistrict() {
  const districtData = {
    name: 'Test District',
    state: 'CA',
    addressStreet: '123 Main St',
    addressCity: 'Los Angeles',
    addressState: 'CA',
    addressZipCode: '90001',
    contactPhone: '555-1234',
    contactEmail: 'contact@testdistrict.edu',
    contactWebsite: 'https://testdistrict.edu'
  }

  const district = await createDistrict(districtData)

  assertNotNull(district, 'District should be created')
  assertNotNull(district.districtId, 'District should have an ID')
  assertEqual(district.name, 'Test District', 'District name should match')
  assertEqual(district.state, 'CA', 'District state should match')
  assertEqual(district.contactEmail, 'contact@testdistrict.edu', 'District email should match')
  assertNotNull(district.createdAt, 'District should have createdAt timestamp')
  assertNotNull(district.updatedAt, 'District should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testDistrictId = district.districtId
}

async function testGetDistrict() {
  const districtId = (global as any).testDistrictId
  assertNotNull(districtId, 'Test district ID should exist from previous test')

  const district = await getDistrict(districtId)

  assertNotNull(district, 'District should be retrieved')
  assertEqual(district.districtId, districtId, 'District ID should match')
  assertEqual(district.name, 'Test District', 'District name should match')
  assertEqual(district.state, 'CA', 'District state should match')
}

async function testUpdateDistrict() {
  const districtId = (global as any).testDistrictId
  assertNotNull(districtId, 'Test district ID should exist from previous test')

  const updateData = {
    name: 'Updated Test District',
    contactPhone: '555-5678',
    contactEmail: 'updated@testdistrict.edu'
  }

  const updatedDistrict = await updateDistrict(districtId, updateData)

  assertNotNull(updatedDistrict, 'Updated district should be returned')
  assertEqual(updatedDistrict.districtId, districtId, 'District ID should remain the same')
  assertEqual(updatedDistrict.name, 'Updated Test District', 'District name should be updated')
  assertEqual(updatedDistrict.contactPhone, '555-5678', 'District phone should be updated')
  assertEqual(updatedDistrict.contactEmail, 'updated@testdistrict.edu', 'District email should be updated')
  assertEqual(updatedDistrict.state, 'CA', 'District state should remain unchanged')
  assert(updatedDistrict.updatedAt !== updatedDistrict.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllDistricts() {
  const districts = await getAllDistricts()

  assertNotNull(districts, 'Districts array should be returned')
  assert(Array.isArray(districts), 'Districts should be an array')
  assert(districts.length > 0, 'Districts array should not be empty')

  const testDistrict = districts.find((d: any) => d.districtId === (global as any).testDistrictId)
  assertNotNull(testDistrict, 'Test district should be in the list')
}

async function testGetDistrictsByState() {
  const districts = await getDistrictsByState('CA')

  assertNotNull(districts, 'Districts array should be returned')
  assert(Array.isArray(districts), 'Districts should be an array')
  assert(districts.length > 0, 'Districts array should not be empty')

  // All districts should have state = 'CA'
  for (const district of districts) {
    assertEqual(district.state, 'CA', 'All districts should be in CA')
  }

  const testDistrict = districts.find((d: any) => d.districtId === (global as any).testDistrictId)
  assertNotNull(testDistrict, 'Test district should be in the CA state list')
}

async function testDeleteDistrict() {
  const districtId = (global as any).testDistrictId
  assertNotNull(districtId, 'Test district ID should exist from previous test')

  const deletedDistrict = await deleteDistrict(districtId)

  assertNotNull(deletedDistrict, 'Deleted district should be returned')
  assertEqual(deletedDistrict.districtId, districtId, 'Deleted district ID should match')

  // Verify district is actually deleted
  const district = await getDistrict(districtId)
  assertEqual(district, null, 'District should not exist after deletion')
}

// Additional test: Create district with minimal data
async function testCreateDistrictMinimalData() {
  const districtData = {
    name: 'Minimal District',
    state: 'NY'
  }

  const district = await createDistrict(districtData)

  assertNotNull(district, 'District should be created with minimal data')
  assertNotNull(district.districtId, 'District should have an ID')
  assertEqual(district.name, 'Minimal District', 'District name should match')
  assertEqual(district.state, 'NY', 'District state should match')

  // Cleanup
  await deleteDistrict(district.districtId)
}

// Additional test: Update partial fields
async function testUpdatePartialFields() {
  const districtData = {
    name: 'Partial Update District',
    state: 'TX'
  }

  const district = await createDistrict(districtData)
  const districtId = district.districtId

  // Update only the website
  const updateData = {
    contactWebsite: 'https://newwebsite.edu'
  }

  const updatedDistrict = await updateDistrict(districtId, updateData)

  assertNotNull(updatedDistrict, 'Updated district should be returned')
  assertEqual(updatedDistrict.contactWebsite, 'https://newwebsite.edu', 'Website should be updated')
  assertEqual(updatedDistrict.name, 'Partial Update District', 'Name should remain unchanged')
  assertEqual(updatedDistrict.state, 'TX', 'State should remain unchanged')

  // Cleanup
  await deleteDistrict(districtId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running District Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create District', testCreateDistrict)
  await runTest('Get District', testGetDistrict)
  await runTest('Update District', testUpdateDistrict)
  await runTest('Get All Districts', testGetAllDistricts)
  await runTest('Get Districts By State', testGetDistrictsByState)
  await runTest('Delete District', testDeleteDistrict)
  await runTest('Create District with Minimal Data', testCreateDistrictMinimalData)
  await runTest('Update Partial Fields', testUpdatePartialFields)

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
