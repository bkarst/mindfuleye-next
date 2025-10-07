import { createDistrictTable } from './createDistrict';
import { createSchoolTable } from './createSchool';
import { createParentTable } from './createParent';
import { createStudentTable } from './createStudent';
import { createParentStudentRelationshipTable } from './createParentStudentRelationship';
import { createTeacherTable } from './createTeacher';
import { createTeacherSchoolRelationshipTable } from './createTeacherSchoolRelationship';
import { createStudentTeacherRelationshipTable } from './createStudentTeacherRelationship';
import { createStudentSurveyTable } from './createStudentSurvey';
import { createSurveyQuestionTable } from './createSurveyQuestion';
import { createUserSurveyTable } from './createUserSurvey';
import { createSurveyResponseTable } from './createSurveyResponse';

/**
 * Creates all DynamoDB tables for the Mindful Eye platform
 * Tables are created in dependency order where possible
 * Skips tables that already exist
 */
async function createAllTables() {
  console.log('Starting creation of all DynamoDB tables...\n');

  const tables = [
    { name: 'District', createFn: createDistrictTable },
    { name: 'School', createFn: createSchoolTable },
    { name: 'Parent', createFn: createParentTable },
    { name: 'Student', createFn: createStudentTable },
    { name: 'Teacher', createFn: createTeacherTable },
    { name: 'ParentStudentRelationship', createFn: createParentStudentRelationshipTable },
    { name: 'TeacherSchoolRelationship', createFn: createTeacherSchoolRelationshipTable },
    { name: 'StudentTeacherRelationship', createFn: createStudentTeacherRelationshipTable },
    { name: 'StudentSurvey', createFn: createStudentSurveyTable },
    { name: 'SurveyQuestion', createFn: createSurveyQuestionTable },
    { name: 'UserSurvey', createFn: createUserSurveyTable },
    { name: 'SurveyResponse', createFn: createSurveyResponseTable }
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const table of tables) {
    try {
      console.log(`\n[${tables.indexOf(table) + 1}/${tables.length}] Processing ${table.name}...`);
      await table.createFn();
      successCount++;
    } catch (error: any) {
      if (error.name === 'ResourceInUseException') {
        skipCount++;
      } else {
        errorCount++;
        console.error(`Failed to create ${table.name}:`, error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Table Creation Summary:');
  console.log('='.repeat(60));
  console.log(`✓ Successfully created: ${successCount}`);
  console.log(`⊘ Skipped (already exists): ${skipCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`Total tables: ${tables.length}`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    throw new Error(`Failed to create ${errorCount} table(s)`);
  }
}

// Run if executed directly
if (require.main === module) {
  createAllTables()
    .then(() => {
      console.log('\n✓ All table operations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Table creation failed:', error.message);
      process.exit(1);
    });
}

export { createAllTables };
