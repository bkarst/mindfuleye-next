import { createTable } from './migrate-helper';

/**
 * Creates the StudentTeacherRelationship table in DynamoDB
 * Table stores student-teacher assignments by academic year
 */
export async function createStudentTeacherRelationshipTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'teacherIdAcademicYear',
        AttributeType: 'S' // String - composite "teacherId#academicYear"
      },
      {
        AttributeName: 'teacherId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'academicYear',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'isCurrent',
        AttributeType: 'S' // String - "true" or "false"
      }
    ],
    KeySchema: [
      {
        AttributeName: 'studentId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'teacherIdAcademicYear',
        KeyType: 'RANGE' // Sort key
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TeacherStudentsIndex',
        KeySchema: [
          {
            AttributeName: 'teacherId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'academicYear',
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
        IndexName: 'CurrentAssignmentsIndex',
        KeySchema: [
          {
            AttributeName: 'isCurrent',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'studentId',
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

  await createTable('StudentTeacherRelationship', params);
}

// Run if executed directly
if (require.main === module) {
  createStudentTeacherRelationshipTable()
    .then(() => {
      console.log('StudentTeacherRelationship table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create StudentTeacherRelationship table:', error);
      process.exit(1);
    });
}
