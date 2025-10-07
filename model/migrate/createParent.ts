import { createTable } from './migrate-helper';

/**
 * Creates the Parent table in DynamoDB
 * Table stores parent user account information
 */
export async function createParentTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'parentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'email',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'parentId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          {
            AttributeName: 'email',
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
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  await createTable('Parent', params);
}

// Run if executed directly
if (require.main === module) {
  createParentTable()
    .then(() => {
      console.log('Parent table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create Parent table:', error);
      process.exit(1);
    });
}
