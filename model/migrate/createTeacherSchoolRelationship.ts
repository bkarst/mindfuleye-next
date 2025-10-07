import { createTable } from './migrate-helper';

/**
 * Creates the TeacherSchoolRelationship table in DynamoDB
 * Table stores teacher employment history at schools
 */
export async function createTeacherSchoolRelationshipTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'teacherId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'schoolIdStartDate',
        AttributeType: 'S' // String - composite "schoolId#startDate"
      },
      {
        AttributeName: 'schoolId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'isCurrent',
        AttributeType: 'S' // String - "true" or "false"
      }
    ],
    KeySchema: [
      {
        AttributeName: 'teacherId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'schoolIdStartDate',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'SchoolTeachersIndex',
        KeySchema: [
          {
            AttributeName: 'schoolId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'teacherId',
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
        IndexName: 'CurrentTeachersIndex',
        KeySchema: [
          {
            AttributeName: 'isCurrent',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'schoolId',
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

  await createTable('TeacherSchoolRelationship', params);
}

// Run if executed directly
if (require.main === module) {
  createTeacherSchoolRelationshipTable()
    .then(() => {
      console.log('TeacherSchoolRelationship table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create TeacherSchoolRelationship table:', error);
      process.exit(1);
    });
}
