import { createTable } from './migrate-helper';

/**
 * Creates the Student table in DynamoDB
 * Table stores student profiles that can be associated with multiple parents
 */
export async function createStudentTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'schoolId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'grade',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'studentId',
        KeyType: 'HASH' // Partition key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'SchoolStudentsIndex',
        KeySchema: [
          {
            AttributeName: 'schoolId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'grade',
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

  await createTable('Student', params);
}

// Run if executed directly
if (require.main === module) {
  createStudentTable()
    .then(() => {
      console.log('Student table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create Student table:', error);
      process.exit(1);
    });
}
