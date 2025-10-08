import { createTable } from './migrate-helper';

/**
 * Creates the Survey table in DynamoDB
 * Table stores survey templates that define what questions will be asked
 */
export async function createSurveyTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'surveyId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'isActive',
        AttributeType: 'S' // String (stored as 'true'/'false')
      },
      {
        AttributeName: 'surveyType',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'createdAt',
        AttributeType: 'S' // String (ISO 8601 timestamp)
      }
    ],
    KeySchema: [
      {
        AttributeName: 'surveyId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ActiveSurveysIndex',
        KeySchema: [
          {
            AttributeName: 'isActive',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'surveyType',
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
        IndexName: 'SurveyTypeIndex',
        KeySchema: [
          {
            AttributeName: 'surveyType',
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

  await createTable('Survey', params);
}

// Run if executed directly
if (require.main === module) {
  createSurveyTable()
    .then(() => {
      console.log('Survey table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create Survey table:', error);
      process.exit(1);
    });
}
