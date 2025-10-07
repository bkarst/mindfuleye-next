import { createTable } from './migrate-helper';

/**
 * Creates the SurveyQuestion table in DynamoDB
 * Table stores survey question definitions and configuration
 */
export async function createSurveyQuestionTable() {
  const params = {
    AttributeDefinitions: [
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
      },
      {
        AttributeName: 'isActive',
        AttributeType: 'S' // String (storing boolean as 'true'/'false')
      }
    ],
    KeySchema: [
      {
        AttributeName: 'questionId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
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
      },
      {
        IndexName: 'ActiveQuestionsIndex',
        KeySchema: [
          {
            AttributeName: 'isActive',
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
