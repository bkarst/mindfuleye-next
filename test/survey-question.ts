import { config } from 'dotenv'
// Load environment variables
config()

import { createSurveyQuestion, deleteSurveyQuestion, getSurveyQuestion, updateSurveyQuestion, getAllSurveyQuestions, getQuestionsByCategory, getActiveQuestions } from '../model/survey-question'

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
async function testCreateSurveyQuestion() {
  const questionData = {
    questionText: 'How would you rate your child\'s academic progress this week?',
    questionCategory: 'Academic',
    responseType: 'Scale' as const,
    orderIndex: 1,
    isRequired: true,
    isActive: true,
    helperText: 'Consider homework completion, test scores, and teacher feedback'
  }

  const question = await createSurveyQuestion(questionData)

  assertNotNull(question, 'Survey question should be created')
  assertNotNull(question.questionId, 'Survey question should have an ID')
  assertEqual(question.questionText, 'How would you rate your child\'s academic progress this week?', 'Question text should match')
  assertEqual(question.questionCategory, 'Academic', 'Question category should match')
  assertEqual(question.responseType, 'Scale', 'Response type should match')
  assertEqual(question.orderIndex, 1, 'Order index should match')
  assertEqual(question.isRequired, 'true', 'isRequired should match')
  assertEqual(question.isActive, 'true', 'isActive should match')
  assertEqual(question.helperText, 'Consider homework completion, test scores, and teacher feedback', 'Helper text should match')
  assertNotNull(question.createdAt, 'Question should have createdAt timestamp')
  assertNotNull(question.updatedAt, 'Question should have updatedAt timestamp')

  // Store for later tests
  ;(global as any).testQuestionId = question.questionId
  ;(global as any).testQuestionCategory = question.questionCategory
}

async function testGetSurveyQuestion() {
  const questionId = (global as any).testQuestionId
  assertNotNull(questionId, 'Test question ID should exist from previous test')

  const question = await getSurveyQuestion(questionId)

  assertNotNull(question, 'Survey question should be retrieved')
  assertEqual(question.questionId, questionId, 'Question ID should match')
  assertEqual(question.questionText, 'How would you rate your child\'s academic progress this week?', 'Question text should match')
  assertEqual(question.questionCategory, 'Academic', 'Question category should match')
  assertEqual(question.responseType, 'Scale', 'Response type should match')
}

async function testUpdateSurveyQuestion() {
  const questionId = (global as any).testQuestionId
  assertNotNull(questionId, 'Test question ID should exist from previous test')

  const updateData = {
    questionText: 'How would you rate your child\'s overall academic progress this week?',
    helperText: 'Consider homework, tests, participation, and teacher feedback',
    orderIndex: 2
  }

  const updatedQuestion = await updateSurveyQuestion(questionId, updateData)

  assertNotNull(updatedQuestion, 'Updated question should be returned')
  assertEqual(updatedQuestion.questionId, questionId, 'Question ID should remain the same')
  assertEqual(updatedQuestion.questionText, 'How would you rate your child\'s overall academic progress this week?', 'Question text should be updated')
  assertEqual(updatedQuestion.helperText, 'Consider homework, tests, participation, and teacher feedback', 'Helper text should be updated')
  assertEqual(updatedQuestion.orderIndex, 2, 'Order index should be updated')
  assertEqual(updatedQuestion.questionCategory, 'Academic', 'Question category should remain unchanged')
  assertEqual(updatedQuestion.responseType, 'Scale', 'Response type should remain unchanged')
  assert(updatedQuestion.updatedAt !== updatedQuestion.createdAt, 'UpdatedAt should be different from createdAt')
}

async function testGetAllSurveyQuestions() {
  const questions = await getAllSurveyQuestions()

  assertNotNull(questions, 'Questions array should be returned')
  assert(Array.isArray(questions), 'Questions should be an array')
  assert(questions.length > 0, 'Questions array should not be empty')

  const testQuestion = questions.find((q: any) => q.questionId === (global as any).testQuestionId)
  assertNotNull(testQuestion, 'Test question should be in the list')
}

async function testGetQuestionsByCategory() {
  const category = (global as any).testQuestionCategory
  assertNotNull(category, 'Test question category should exist from previous test')

  const questions = await getQuestionsByCategory(category)

  assertNotNull(questions, 'Questions array should be returned')
  assert(Array.isArray(questions), 'Questions should be an array')
  assert(questions.length > 0, 'Questions array should not be empty')

  // All questions should have the same category
  for (const question of questions) {
    assertEqual(question.questionCategory, category, 'All questions should be in the same category')
  }

  const testQuestion = questions.find((q: any) => q.questionId === (global as any).testQuestionId)
  assertNotNull(testQuestion, 'Test question should be in the category list')
}

async function testGetActiveQuestions() {
  const questions = await getActiveQuestions()

  assertNotNull(questions, 'Questions array should be returned')
  assert(Array.isArray(questions), 'Questions should be an array')
  assert(questions.length > 0, 'Questions array should not be empty')

  // All questions should be active
  for (const question of questions) {
    assert(question.isActive === true || question.isActive === 'true', 'All questions should be active')
  }

  const testQuestion = questions.find((q: any) => q.questionId === (global as any).testQuestionId)
  assertNotNull(testQuestion, 'Test question should be in the active questions list')
}

async function testDeleteSurveyQuestion() {
  const questionId = (global as any).testQuestionId
  assertNotNull(questionId, 'Test question ID should exist from previous test')

  const deletedQuestion = await deleteSurveyQuestion(questionId)

  assertNotNull(deletedQuestion, 'Deleted question should be returned')
  assertEqual(deletedQuestion.questionId, questionId, 'Deleted question ID should match')

  // Verify question is actually deleted
  const question = await getSurveyQuestion(questionId)
  assertEqual(question, null, 'Question should not exist after deletion')
}

// Additional test: Create question with multiple choice options
async function testCreateMultipleChoiceQuestion() {
  const questionData = {
    questionText: 'What concerns do you have about your child\'s education this week?',
    questionCategory: 'Safety',
    responseType: 'MultipleChoice' as const,
    orderIndex: 10,
    isRequired: false,
    isActive: true,
    questionOptions: ['Curriculum content', 'Peer interactions', 'Teacher communication', 'None'],
    helperText: 'Select all that apply'
  }

  const question = await createSurveyQuestion(questionData)

  assertNotNull(question, 'Multiple choice question should be created')
  assertNotNull(question.questionId, 'Question should have an ID')
  assertEqual(question.responseType, 'MultipleChoice', 'Response type should be MultipleChoice')
  assertNotNull(question.questionOptions, 'Question options should exist')
  assert(Array.isArray(question.questionOptions), 'Question options should be an array')
  assertEqual(question.questionOptions.length, 4, 'Should have 4 options')

  // Cleanup
  await deleteSurveyQuestion(question.questionId)
}

// Additional test: Create minimal question
async function testCreateMinimalQuestion() {
  const questionData = {
    questionText: 'Did your child complete all homework assignments?',
    questionCategory: 'Academic',
    responseType: 'Boolean' as const,
    orderIndex: 5,
    isRequired: true,
    isActive: true
  }

  const question = await createSurveyQuestion(questionData)

  assertNotNull(question, 'Minimal question should be created')
  assertNotNull(question.questionId, 'Question should have an ID')
  assertEqual(question.questionText, 'Did your child complete all homework assignments?', 'Question text should match')
  assertEqual(question.responseType, 'Boolean', 'Response type should be Boolean')

  // Cleanup
  await deleteSurveyQuestion(question.questionId)
}

// Additional test: Update question to inactive
async function testUpdateQuestionToInactive() {
  const questionData = {
    questionText: 'Test inactive question',
    questionCategory: 'Behavioral',
    responseType: 'Text' as const,
    orderIndex: 99,
    isRequired: false,
    isActive: true
  }

  const question = await createSurveyQuestion(questionData)
  const questionId = question.questionId

  assertEqual(question.isActive, 'true', 'Question should initially be active')

  // Deactivate question
  const updatedQuestion = await updateSurveyQuestion(questionId, { isActive: false })
  assertEqual(updatedQuestion.isActive, 'false', 'Question should be inactive after update')

  // Cleanup
  await deleteSurveyQuestion(questionId)
}

// Additional test: Different question categories
async function testDifferentQuestionCategories() {
  const categories = ['Academic', 'Safety', 'Social', 'Behavioral', 'Communication']
  const createdQuestions: any[] = []

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    const questionData = {
      questionText: `Test question for ${category}`,
      questionCategory: category,
      responseType: 'Text' as const,
      orderIndex: 100 + i,
      isRequired: false,
      isActive: true
    }

    const question = await createSurveyQuestion(questionData)
    createdQuestions.push(question)

    assertEqual(question.questionCategory, category, `Question category should be ${category}`)
  }

  // Query by each category
  for (const category of categories) {
    const questions = await getQuestionsByCategory(category)
    const testQuestion = questions.find((q: any) => q.questionText === `Test question for ${category}`)
    assertNotNull(testQuestion, `Should find ${category} question in query results`)
  }

  // Cleanup
  for (const question of createdQuestions) {
    await deleteSurveyQuestion(question.questionId)
  }
}

// Additional test: Different response types
async function testDifferentResponseTypes() {
  const responseTypes = ['Text', 'Number', 'Boolean', 'Scale', 'MultipleChoice', 'Checkbox']
  const createdQuestions: any[] = []

  for (let i = 0; i < responseTypes.length; i++) {
    const responseType = responseTypes[i] as any
    const questionData = {
      questionText: `Test question with ${responseType} response`,
      questionCategory: 'Academic',
      responseType: responseType,
      orderIndex: 200 + i,
      isRequired: true,
      isActive: true,
      questionOptions: (responseType === 'MultipleChoice' || responseType === 'Checkbox')
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined
    }

    const question = await createSurveyQuestion(questionData)
    createdQuestions.push(question)

    assertEqual(question.responseType, responseType, `Response type should be ${responseType}`)
  }

  // Cleanup
  for (const question of createdQuestions) {
    await deleteSurveyQuestion(question.questionId)
  }
}

// Additional test: Update order index
async function testUpdateOrderIndex() {
  const questionData = {
    questionText: 'Original order question',
    questionCategory: 'Academic',
    responseType: 'Number' as const,
    orderIndex: 1,
    isRequired: true,
    isActive: true
  }

  const question = await createSurveyQuestion(questionData)
  const questionId = question.questionId

  assertEqual(question.orderIndex, 1, 'Initial order index should be 1')

  // Change order
  const updatedQuestion = await updateSurveyQuestion(questionId, { orderIndex: 100 })
  assertEqual(updatedQuestion.orderIndex, 100, 'Order index should be updated to 100')

  // Cleanup
  await deleteSurveyQuestion(questionId)
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Running SurveyQuestion Model Tests')
  console.log('='.repeat(60))
  console.log('')

  checkEnvironment()

  await runTest('Create Survey Question', testCreateSurveyQuestion)
  await runTest('Get Survey Question', testGetSurveyQuestion)
  await runTest('Update Survey Question', testUpdateSurveyQuestion)
  await runTest('Get All Survey Questions', testGetAllSurveyQuestions)
  await runTest('Get Questions By Category', testGetQuestionsByCategory)
  await runTest('Get Active Questions', testGetActiveQuestions)
  await runTest('Delete Survey Question', testDeleteSurveyQuestion)
  await runTest('Create Multiple Choice Question', testCreateMultipleChoiceQuestion)
  await runTest('Create Minimal Question', testCreateMinimalQuestion)
  await runTest('Update Question to Inactive', testUpdateQuestionToInactive)
  await runTest('Different Question Categories', testDifferentQuestionCategories)
  await runTest('Different Response Types', testDifferentResponseTypes)
  await runTest('Update Order Index', testUpdateOrderIndex)

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
