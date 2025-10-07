import { createTable } from './migrate-helper';

/**
 * Creates the Teacher table in DynamoDB
 * Table stores teacher information
 */
export async function createTeacherTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'teacherId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'email',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'teacherId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TeacherEmailIndex',
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

  await createTable('Teacher', params);
}

// Run if executed directly
if (require.main === module) {
  createTeacherTable()
    .then(() => {
      console.log('Teacher table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create Teacher table:', error);
      process.exit(1);
    });
}
