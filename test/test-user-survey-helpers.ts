import { timeToUniqueWeekString, calculateExpiresOn } from '../model/user-survey'

/**
 * Test script for user-survey helper functions
 */
function testHelperFunctions() {
  console.log('Testing user-survey helper functions...\n')

  // Test timeToUniqueWeekString
  console.log('=== Testing timeToUniqueWeekString ===')
  const today = new Date()
  const weekString = timeToUniqueWeekString(today)
  console.log(`Current date: ${today.toISOString()}`)
  console.log(`Week string: ${weekString}`)

  // Test with specific dates
  const testDate1 = new Date('2025-01-01')
  const weekString1 = timeToUniqueWeekString(testDate1)
  console.log(`\nDate: ${testDate1.toISOString()}`)
  console.log(`Week string: ${weekString1}`)

  const testDate2 = new Date('2025-03-15')
  const weekString2 = timeToUniqueWeekString(testDate2)
  console.log(`\nDate: ${testDate2.toISOString()}`)
  console.log(`Week string: ${weekString2}`)

  const testDate3 = new Date('2025-12-31')
  const weekString3 = timeToUniqueWeekString(testDate3)
  console.log(`\nDate: ${testDate3.toISOString()}`)
  console.log(`Week string: ${weekString3}`)

  // Test calculateExpiresOn
  console.log('\n=== Testing calculateExpiresOn ===')
  const expiresOn1 = calculateExpiresOn('2025-01')
  console.log(`Week: 2025-01`)
  console.log(`Expires on: ${expiresOn1}`)

  const expiresOn2 = calculateExpiresOn('2025-15')
  console.log(`\nWeek: 2025-15`)
  console.log(`Expires on: ${expiresOn2}`)

  const expiresOn3 = calculateExpiresOn(weekString)
  console.log(`\nWeek: ${weekString}`)
  console.log(`Expires on: ${expiresOn3}`)

  // Calculate how many days from now
  const expiresDate = new Date(expiresOn3)
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  console.log(`Days until expiry: ${daysUntilExpiry}`)

  console.log('\n✅ Helper function tests completed!')
}

// Run tests if executed directly
if (require.main === module) {
  testHelperFunctions()
}

export { testHelperFunctions }
