import { createTable } from './migrate-helper';

/**
 * Creates the UserSurvey table in DynamoDB
 * Table associates parents with student surveys and tracks completion status
 */
export async function createUserSurveyTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'parentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'surveyId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'createdAt',
        AttributeType: 'S' // String - ISO 8601 timestamp
      },
      {
        AttributeName: 'status',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'parentId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'surveyId',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'SurveyParentsIndex',
        KeySchema: [
          {
            AttributeName: 'surveyId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'parentId',
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
        IndexName: 'StudentUserSurveysIndex',
        KeySchema: [
          {
            AttributeName: 'studentId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'createdAt',
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
        IndexName: 'StatusIndex',
        KeySchema: [
          {
            AttributeName: 'status',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'createdAt',
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

  await createTable('UserSurvey', params);
}

// Run if executed directly
if (require.main === module) {
  createUserSurveyTable()
    .then(() => {
      console.log('UserSurvey table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create UserSurvey table:', error);
      process.exit(1);
    });
}
