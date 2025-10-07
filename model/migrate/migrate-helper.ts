import dotenv from 'dotenv';
import { APP_PREFIX } from '@/app/constants';
import { DynamoDBClient, CreateTableCommand, waitUntilTableExists } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Load environment variables from .env file
dotenv.config();

// Initialize DynamoDB client
const dyClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})
const client = DynamoDBDocumentClient.from(dyClient)

// Configuration constants

const ENVIRONMENT = process.env.ENVIRONMENT || 'Development';

/**
 * Generates a DynamoDB table name using the pattern: {APP_PREFIX}{EntityName}{Environment}
 * @param entityName - The entity name (e.g., "Teacher", "Student", "Parent")
 * @returns Full table name (e.g., "MindfulEyeTeacherDevelopment")
 */
export function getTableName(entityName: string): string {
  return `${APP_PREFIX}${entityName}${ENVIRONMENT}`;
}

/**
 * Creates a DynamoDB table with the app-specific naming convention
 * @param entityName - The entity name (e.g., "Teacher", "Student", "Parent")
 * @param params - CreateTableCommand parameters (TableName will be overridden)
 */
export async function createTable(entityName: string, params: any) {
  const tableName = getTableName(entityName);
  const tableParams = {
    ...params,
    TableName: tableName
  };

  try {
    const command = new CreateTableCommand(tableParams);
    const response = await client.send(command);
    console.log(`Creating table: ${tableName}`);

    // Wait until table is active
    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: tableName }
    );

    console.log(`✓ Table ${tableName} created successfully`);
    return response;
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`Table ${tableName} already exists`);
    } else {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }
}
