import { createTable } from './migrate-helper';

/**
 * Creates the SurveyResponse table in DynamoDB
 * Table stores individual question/answer pairs from surveys for granular analysis
 */
export async function createSurveyResponseTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'surveyId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'questionId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'answeredAt',
        AttributeType: 'S' // String - ISO 8601 timestamp
      },
      {
        AttributeName: 'questionCategory',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'concernLevel',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'surveyId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'questionId',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StudentResponsesIndex',
        KeySchema: [
          {
            AttributeName: 'studentId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'answeredAt',
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
        IndexName: 'QuestionCategoryIndex',
        KeySchema: [
          {
            AttributeName: 'questionCategory',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'answeredAt',
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
        IndexName: 'ConcernLevelIndex',
        KeySchema: [
          {
            AttributeName: 'concernLevel',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'answeredAt',
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

  await createTable('SurveyResponse', params);
}

// Run if executed directly
if (require.main === module) {
  createSurveyResponseTable()
    .then(() => {
      console.log('SurveyResponse table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create SurveyResponse table:', error);
      process.exit(1);
    });
}
