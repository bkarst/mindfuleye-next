import { createTable } from './migrate-helper';

/**
 * Creates the SurveyQuestion table in DynamoDB
 * Table stores survey question definitions and configuration
 */
export async function createSurveyQuestionTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'surveyId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'sortKey',
        AttributeType: 'S' // String (format: orderIndex#questionId)
      },
      {
        AttributeName: 'questionId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'questionCategory',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'orderIndex',
        AttributeType: 'N' // Number
      }
    ],
    KeySchema: [
      {
        AttributeName: 'surveyId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'sortKey',
        KeyType: 'RANGE' // Sort key (orderIndex#questionId)
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'QuestionIdIndex',
        KeySchema: [
          {
            AttributeName: 'questionId',
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
        IndexName: 'CategoryOrderIndex',
        KeySchema: [
          {
            AttributeName: 'questionCategory',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'orderIndex',
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

  await createTable('SurveyQuestion', params);
}

// Run if executed directly
if (require.main === module) {
  createSurveyQuestionTable()
    .then(() => {
      console.log('SurveyQuestion table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create SurveyQuestion table:', error);
      process.exit(1);
    });
}
