import { createSurvey } from '../../survey'
import { createSurveyQuestion } from '../../survey-question'

/**
 * Creates the First Grade Student Wellness Survey and all associated questions
 * Based on content/surveys/first-grade.md
 */
export async function createFirstGradeSurvey() {
  console.log('Creating First Grade Student Wellness Survey...')

  try {
    // Create the survey
    const survey = await createSurvey({
      name: 'First Grade Student Wellness Survey',
      grade_level: '1',
      description: 'Weekly wellness survey for parents of first grade students',
      surveyType: 'Weekly',
      targetAudience: 'Parent',
      isActive: true,
      version: 1,
      instructions: 'Please complete this survey about your first grader\'s school experience this week.'
    })

    console.log(`Survey created with ID: ${survey.surveyId}`)

    const surveyId = survey.surveyId
    let orderIndex = 1

    // Communication About School Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'I have asked my child about what they are learning in school this week.',
      questionCategory: 'Communication About School',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'Every day this week',
        '2-4 times this week',
        '1 time this week',
        '0 times this week'
      ],
      sectionName: 'Communication About School'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have reviewed my child\'s homework this week.',
      questionCategory: 'Communication About School',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'Yes, I have reviewed all of it',
        'I reviewed some but not all',
        'No, I have not reviewed it at all'
      ],
      sectionName: 'Communication About School'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have talked with my child about how they are interacting with other kids at school this week.',
      questionCategory: 'Communication About School',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Communication About School'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child talks positively about school.',
      questionCategory: 'Communication About School',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'],
      sectionName: 'Communication About School'
    })

    // Safety and Social Concerns Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'How concerned are you about your child\'s physical safety at school?',
      questionCategory: 'Safety and Social Concerns',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Not at all concerned', 'Somewhat concerned', 'Very concerned'],
      sectionName: 'Safety and Social Concerns'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'How concerned are you about your child making friends and being socially accepted?',
      questionCategory: 'Safety and Social Concerns',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Not at all concerned', 'Somewhat concerned', 'Very concerned'],
      sectionName: 'Safety and Social Concerns'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'How concerned are you about your child\'s behavior in the classroom?',
      questionCategory: 'Safety and Social Concerns',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Not at all concerned', 'Somewhat concerned', 'Very concerned'],
      sectionName: 'Safety and Social Concerns'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child seems happy and well-adjusted at school.',
      questionCategory: 'Safety and Social Concerns',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Strongly agree', 'Agree', 'Somewhat agree', 'Disagree', 'I don\'t know'],
      sectionName: 'Safety and Social Concerns'
    })

    // Reading and Language Arts Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'I have talked with my child about their reading progress.',
      questionCategory: 'Reading and Language Arts',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Reading and Language Arts'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'After speaking with my child about reading:',
      questionCategory: 'Reading and Language Arts',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'I\'m happy with my child\'s progress',
        'I\'m not concerned about my child\'s progress',
        'I\'m concerned about my child\'s progress'
      ],
      sectionName: 'Reading and Language Arts'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child is engaged and showing improvement in reading.',
      questionCategory: 'Reading and Language Arts',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Strongly agree', 'Agree', 'Somewhat agree', 'Disagree', 'I don\'t know'],
      sectionName: 'Reading and Language Arts'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child is being appropriately challenged in reading.',
      questionCategory: 'Reading and Language Arts',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Strongly agree', 'Agree', 'Somewhat agree', 'Disagree', 'I don\'t know'],
      sectionName: 'Reading and Language Arts'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I read with my child at home.',
      questionCategory: 'Reading and Language Arts',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Every day', '3-5 times per week', '1-2 times per week', 'Rarely', 'Never'],
      sectionName: 'Reading and Language Arts'
    })

    // Mathematics Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'I have talked with my child about their math studies.',
      questionCategory: 'Mathematics',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Mathematics'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'After speaking with my child about math:',
      questionCategory: 'Mathematics',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'I\'m happy with my child\'s progress',
        'I\'m not concerned about my child\'s progress',
        'I\'m concerned about my child\'s progress'
      ],
      sectionName: 'Mathematics'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child is engaged and showing improvement in math.',
      questionCategory: 'Mathematics',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Strongly agree', 'Agree', 'Somewhat agree', 'Disagree', 'I don\'t know'],
      sectionName: 'Mathematics'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child is being appropriately challenged in math.',
      questionCategory: 'Mathematics',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Strongly agree', 'Agree', 'Somewhat agree', 'Disagree', 'I don\'t know'],
      sectionName: 'Mathematics'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I practice math skills (counting, addition, subtraction) with my child at home.',
      questionCategory: 'Mathematics',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Every day', '3-5 times per week', '1-2 times per week', 'Rarely', 'Never'],
      sectionName: 'Mathematics'
    })

    // Parent Engagement Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'I have requested my child\'s curriculum from their teacher or school.',
      questionCategory: 'Parent Engagement',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Parent Engagement'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have examined my child\'s curriculum.',
      questionCategory: 'Parent Engagement',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Parent Engagement'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have connected with other first grade parents for events or playdates.',
      questionCategory: 'Parent Engagement',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Parent Engagement'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have attended parent-teacher conferences.',
      questionCategory: 'Parent Engagement',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Yes', 'No'],
      sectionName: 'Parent Engagement'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I communicate with my child\'s teacher.',
      questionCategory: 'Parent Engagement',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Regularly (weekly or more)', 'Occasionally (monthly)', 'Rarely', 'Never'],
      sectionName: 'Parent Engagement'
    })

    // Learning Environment Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'After reviewing the curriculum and discussing what my child is learning in school:',
      questionCategory: 'Learning Environment',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'My child has a positive learning environment',
        'My child has a somewhat positive learning environment',
        'My child\'s learning environment could be much better',
        'My child\'s learning environment needs improvement',
        'I don\'t have enough information'
      ],
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I have observed or found evidence of political bias in my child\'s studies.',
      questionCategory: 'Learning Environment',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'Yes, significant evidence',
        'Some minor concerns',
        'No evidence of political bias',
        'I don\'t know'
      ],
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'If yes, what political bias have you found? Can you describe it and where it is coming from?',
      questionCategory: 'Learning Environment',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'To my knowledge, I would say my child is being exposed to:',
      questionCategory: 'Learning Environment',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'Age-appropriate content aligned with my values',
        'Some content I\'m not comfortable with',
        'Significant content that conflicts with my values',
        'I don\'t have enough information'
      ],
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'If you have concerns, please describe what content concerns you:',
      questionCategory: 'Learning Environment',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'My child has mentioned learning about or discussing topics such as:',
      questionCategory: 'Learning Environment',
      responseType: 'Checkbox',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: [
        'Critical race theory or systemic racism',
        'White privilege or racial privilege',
        'Gender identity, gender studies, or cisgender privilege',
        'Social justice or equity',
        'None of the above',
        'I don\'t know'
      ],
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'If yes, please describe what your child has mentioned and in what context:',
      questionCategory: 'Learning Environment',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Learning Environment'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I am comfortable with how these topics are being discussed (if applicable):',
      questionCategory: 'Learning Environment',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      questionOptions: [
        'Yes, age-appropriate and aligned with my values',
        'Somewhat comfortable',
        'Not comfortable',
        'Very uncomfortable',
        'Not applicable'
      ],
      sectionName: 'Learning Environment'
    })

    // Homework and Study Support Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'My child completes homework independently.',
      questionCategory: 'Homework and Study Support',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'],
      sectionName: 'Homework and Study Support'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I assist my child with homework when needed.',
      questionCategory: 'Homework and Study Support',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'],
      sectionName: 'Homework and Study Support'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'The amount of homework is:',
      questionCategory: 'Homework and Study Support',
      responseType: 'MultipleChoice',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Too much', 'Appropriate', 'Too little', 'No homework assigned'],
      sectionName: 'Homework and Study Support'
    })

    // Self-Reflection Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'This is what I\'ve learned from my child\'s responses to my questions this week:',
      questionCategory: 'Self-Reflection',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Self-Reflection'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I could do better with monitoring what my child is learning.',
      questionCategory: 'Self-Reflection',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Agree', 'Somewhat agree', 'Somewhat disagree', 'Disagree'],
      sectionName: 'Self-Reflection'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'How could I better monitor and help my child at school?',
      questionCategory: 'Self-Reflection',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Self-Reflection'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'How would you rate your involvement in your child\'s education this week?',
      questionCategory: 'Self-Reflection',
      responseType: 'Scale',
      orderIndex: orderIndex++,
      isRequired: true,
      isActive: true,
      questionOptions: ['Excellent (A)', 'Good (B)', 'Average (C)', 'Below average (D)', 'Needs improvement (F)'],
      sectionName: 'Self-Reflection'
    })

    // Goals and Next Steps Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'My goals for supporting my child\'s education next week:',
      questionCategory: 'Goals and Next Steps',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Goals and Next Steps'
    })

    await createSurveyQuestion({
      surveyId,
      questionText: 'I need additional support or resources in the following areas:',
      questionCategory: 'Goals and Next Steps',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Goals and Next Steps'
    })

    // Additional Comments Section
    await createSurveyQuestion({
      surveyId,
      questionText: 'Is there anything else you\'d like to share about your child\'s first grade experience this week?',
      questionCategory: 'Additional Comments',
      responseType: 'Text',
      orderIndex: orderIndex++,
      isRequired: false,
      isActive: true,
      sectionName: 'Additional Comments'
    })

    console.log(`✓ Successfully created First Grade Survey with ${orderIndex - 1} questions`)
    console.log(`Survey ID: ${surveyId}`)

    return survey
  } catch (error) {
    console.error('Error creating First Grade Survey:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  createFirstGradeSurvey()
    .then(() => {
      console.log('\n✓ First Grade Survey creation completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n✗ First Grade Survey creation failed:', error)
      process.exit(1)
    })
}
