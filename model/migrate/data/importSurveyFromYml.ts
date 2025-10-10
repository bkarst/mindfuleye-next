import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { createSurvey, getSurvey } from '../../survey';
import { createSurveyQuestion, getQuestionsBySurvey } from '../../survey-question';

// Load environment variables from .env file
dotenv.config();

/**
 * Interface for Survey data from YML
 */
interface SurveyYml {
  surveyId?: string;
  name: string;
  grade_level?: string;
  description?: string;
  surveyType: string;
  targetAudience?: string;
  isActive?: boolean;
  version?: number;
  instructions?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for SurveyQuestion data from YML
 */
interface SurveyQuestionYml {
  surveyId: string;
  questionId: string;
  orderIndex: number;
  showInAnalytics?: boolean;
  questionText: string;
  responseType: 'Text' | 'Number' | 'Boolean' | 'Scale' | 'MultipleChoice' | 'Checkbox';
  questionCategory: string;
  isRequired: boolean;
  isActive: boolean;
  questionOptions?: string[];
  sectionName?: string;
  conditionalLogic?: string;
  helperText?: string;
}

/**
 * Interface for the entire YML structure
 */
interface SurveyImportYml {
  Survey: SurveyYml[];
  SurveyQuestion: SurveyQuestionYml[];
}

/**
 * Import survey and questions from a YML file
 * @param ymlFilePath - Path to the YML file (relative to project root or absolute)
 */
async function importSurveyFromYml(ymlFilePath: string): Promise<void> {
  try {
    console.log(`\n📖 Reading YML file: ${ymlFilePath}`);

    // Read the YML file
    const fileContents = fs.readFileSync(ymlFilePath, 'utf8');
    const data = yaml.parse(fileContents) as SurveyImportYml;

    if (!data.Survey || data.Survey.length === 0) {
      throw new Error('No Survey data found in YML file');
    }

    if (!data.SurveyQuestion || data.SurveyQuestion.length === 0) {
      throw new Error('No SurveyQuestion data found in YML file');
    }

    // Get the first survey (assuming one survey per file)
    const surveyData = data.Survey[0];

    if (!surveyData.surveyId) {
      throw new Error('Survey must have a surveyId in the YML file for idempotent imports');
    }

    console.log(`\n🔍 Checking if survey exists: ${surveyData.surveyId}`);

    // Check if survey already exists
    const existingSurvey = await getSurvey(surveyData.surveyId);
    let survey;

    if (existingSurvey) {
      console.log(`✓ Survey already exists: ${surveyData.name}`);
      survey = existingSurvey;
    } else {
      console.log(`📝 Creating survey: ${surveyData.name}`);

      // Create the survey with the specific surveyId from YML
      survey = await createSurvey({
        surveyId: surveyData.surveyId,
        name: surveyData.name,
        grade_level: surveyData.grade_level,
        description: surveyData.description,
        surveyType: surveyData.surveyType,
        targetAudience: surveyData.targetAudience,
        isActive: surveyData.isActive !== undefined ? surveyData.isActive : true,
        version: surveyData.version || 1,
        instructions: surveyData.instructions,
        createdBy: surveyData.createdBy || 'system-import'
      });

      console.log(`✅ Survey created with ID: ${survey.surveyId}`);
    }

    // Use the surveyId from the YML file for all questions
    const actualSurveyId = surveyData.surveyId;

    console.log(`\n🔍 Checking existing questions...`);

    // Get all existing questions for this survey
    const existingQuestions = await getQuestionsBySurvey(actualSurveyId);

    // Create a map of existing questionIds for quick lookup
    // sortKey format is: orderIndex#questionId, so we extract the questionId
    const existingQuestionIds = new Set<string>();
    for (const q of existingQuestions) {
      // Extract questionId from sortKey (format: "001#abc123")
      const questionId = q.sortKey ? q.sortKey.split('#')[1] : q.questionId;
      if (questionId) {
        existingQuestionIds.add(questionId);
      }
    }

    console.log(`   Found ${existingQuestionIds.size} existing questions`);
    console.log(`\n📋 Processing ${data.SurveyQuestion.length} questions...`);

    // Create each question if it doesn't exist
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const questionData of data.SurveyQuestion) {
      try {
        if (existingQuestionIds.has(questionData.questionId)) {
          // Question already exists, skip it
          skippedCount++;
          process.stdout.write(`\r  Progress: ${createdCount + skippedCount}/${data.SurveyQuestion.length} (${createdCount} created, ${skippedCount} skipped)`);
        } else {
          // Question doesn't exist, create it
          await createSurveyQuestion({
            surveyId: actualSurveyId,
            questionId: questionData.questionId, // Use the questionId from YML for idempotency
            questionText: questionData.questionText,
            questionCategory: questionData.questionCategory,
            responseType: questionData.responseType,
            orderIndex: questionData.orderIndex,
            isRequired: questionData.isRequired,
            isActive: questionData.isActive,
            questionOptions: questionData.questionOptions,
            helperText: questionData.helperText,
            sectionName: questionData.sectionName,
            conditionalLogic: questionData.conditionalLogic,
            showInAnalytics: questionData.showInAnalytics
          });

          createdCount++;
          process.stdout.write(`\r  Progress: ${createdCount + skippedCount}/${data.SurveyQuestion.length} (${createdCount} created, ${skippedCount} skipped)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error processing question ${questionData.questionId}:`, error);
      }
    }

    console.log(`\n\n✅ Import completed!`);
    console.log(`   Survey ID: ${actualSurveyId}`);
    console.log(`   Questions created: ${createdCount}`);
    console.log(`   Questions skipped (already exist): ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }
    console.log(`\n`);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  }
}

/**
 * Main function to handle command line arguments
 */
async function main() {
  // Get the YML file path from command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: YML file path is required');
    console.log('\nUsage:');
    console.log('  npx tsx model/migrate/data/importSurveyFromYml.ts <yml-file-path>');
    console.log('\nExample:');
    console.log('  npx tsx model/migrate/data/importSurveyFromYml.ts content/yml/first-grade-weekly.yml');
    process.exit(1);
  }

  const ymlFilePath = args[0];

  // Check if file exists
  if (!fs.existsSync(ymlFilePath)) {
    console.error(`❌ Error: File not found: ${ymlFilePath}`);
    process.exit(1);
  }

  try {
    await importSurveyFromYml(ymlFilePath);
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { importSurveyFromYml };
