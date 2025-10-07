import { createTable } from './migrate-helper';

/**
 * Creates the StudentSurvey table in DynamoDB
 * Table stores weekly accountability check-in responses for students
 */
export async function createStudentSurveyTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'surveyTimestamp',
        AttributeType: 'S' // String - ISO 8601 timestamp
      },
      {
        AttributeName: 'surveyId',
        AttributeType: 'S' // String - UUID
      },
      {
        AttributeName: 'parentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'weekNumber',
        AttributeType: 'N' // Number
      }
    ],
    KeySchema: [
      {
        AttributeName: 'studentId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'surveyTimestamp',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'SurveyIdIndex',
        KeySchema: [
          {
            AttributeName: 'surveyId',
            KeyType: 'HASH' // Partition key
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'ParentSurveysIndex',
        KeySchema: [
          {
            AttributeName: 'parentId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'surveyTimestamp',
            KeyType: 'RANGE' // Sort key
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'WeeklyReportsIndex',
        KeySchema: [
          {
            AttributeName: 'weekNumber',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'surveyTimestamp',
            KeyType: 'RANGE' // Sort key
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  await createTable('StudentSurvey', params);
}

// Run if executed directly
if (require.main === module) {
  createStudentSurveyTable()
    .then(() => {
      console.log('StudentSurvey table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create StudentSurvey table:', error);
      process.exit(1);
    });
}
