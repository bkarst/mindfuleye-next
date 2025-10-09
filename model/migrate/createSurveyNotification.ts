import { createTable } from './migrate-helper';

/**
 * Creates the SurveyNotification table in DynamoDB
 * Table stores notifications sent to parents when weekly surveys become available
 */
export async function createSurveyNotificationTable() {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: 'parentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'sortKey',
        AttributeType: 'S' // String (scheduledDate#notificationId)
      },
      {
        AttributeName: 'scheduledDate',
        AttributeType: 'S' // String (ISO 8601 date)
      },
      {
        AttributeName: 'scheduledTime',
        AttributeType: 'S' // String (24hr format)
      },
      {
        AttributeName: 'status',
        AttributeType: 'S' // String (Scheduled/Sent/Delivered/Failed/Cancelled)
      },
      {
        AttributeName: 'scheduledDateTime',
        AttributeType: 'S' // String (scheduledDate#scheduledTime for GSI)
      },
      {
        AttributeName: 'studentId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'surveyInstanceId',
        AttributeType: 'S' // String
      },
      {
        AttributeName: 'createdAt',
        AttributeType: 'S' // String (ISO 8601 timestamp)
      }
    ],
    KeySchema: [
      {
        AttributeName: 'parentId',
        KeyType: 'HASH' // Partition key
      },
      {
        AttributeName: 'sortKey',
        KeyType: 'RANGE' // Sort key (scheduledDate#notificationId)
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ScheduledDateIndex',
        KeySchema: [
          {
            AttributeName: 'scheduledDate',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'scheduledTime',
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
        IndexName: 'StatusIndex',
        KeySchema: [
          {
            AttributeName: 'status',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'scheduledDateTime',
            KeyType: 'RANGE' // Sort key (scheduledDate#scheduledTime)
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
        IndexName: 'StudentNotificationsIndex',
        KeySchema: [
          {
            AttributeName: 'studentId',
            KeyType: 'HASH' // Partition key
          },
          {
            AttributeName: 'scheduledDate',
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
        IndexName: 'SurveyInstanceIndex',
        KeySchema: [
          {
            AttributeName: 'surveyInstanceId',
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

  await createTable('SurveyNotification', params);
}

// Run if executed directly
if (require.main === module) {
  createSurveyNotificationTable()
    .then(() => {
      console.log('SurveyNotification table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create SurveyNotification table:', error);
      process.exit(1);
    });
}
