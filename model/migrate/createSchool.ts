import { createTable } from './migrate-helper';

/**
 * Creates the School table in DynamoDB
 * Table stores individual school information
 */
export async function createSchoolTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'schoolId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'districtId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'name',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'level',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'schoolId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'DistrictSchoolsIndex',
        KeySchema: [
          {
            AttributeName: 'districtId',
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
      },
      {
        IndexName: 'SchoolLevelIndex',
        KeySchema: [
          {
            AttributeName: 'level',
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

  await createTable('School', params);
}

// Run if executed directly
if (require.main === module) {
  createSchoolTable()
    .then(() => {
      console.log('School table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create School table:', error);
      process.exit(1);
    });
}
