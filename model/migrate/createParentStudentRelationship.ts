import { createTable } from './migrate-helper';

/**
 * Creates the ParentStudentRelationship table in DynamoDB
 * Table stores the many-to-many relationship between parents and students
 */
export async function createParentStudentRelationshipTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'parentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      }
    ],
    KeySchema: [
      {
        AttributeName: 'parentId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'studentId',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StudentParentsIndex',
        KeySchema: [
          {
            AttributeName: 'studentId',
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
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  await createTable('ParentStudentRelationship', params);
}

// Run if executed directly
if (require.main === module) {
  createParentStudentRelationshipTable()
    .then(() => {
      console.log('ParentStudentRelationship table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create ParentStudentRelationship table:', error);
      process.exit(1);
    });
}
