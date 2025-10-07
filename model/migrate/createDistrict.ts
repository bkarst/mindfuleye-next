import { createTable } from './migrate-helper';

/**
 * Creates the District table in DynamoDB
 * Table stores school district information
 */
export async function createDistrictTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'districtId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'state',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'name',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'districtId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StateIndex',
        KeySchema: [
          {
            AttributeName: 'state',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'name',
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

  await createTable('District', params);
}

// Run if executed directly
if (require.main === module) {
  createDistrictTable()
    .then(() => {
      console.log('District table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create District table:', error);
      process.exit(1);
    });
}
