import dotenv from 'dotenv'
// Load environment variables from .env file
dotenv.config()

import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

import { APP_PREFIX, generateRandomString, RUNTIME_ENV } from '@/app/constants'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const dyClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})
const docClient = DynamoDBDocumentClient.from(dyClient)

export const getParentTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}ParentDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}ParentTest`
  } else {
    return `${APP_PREFIX}Parent`
  }
}


export async function createParent(parentData: {
  email: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
  notificationEmail?: boolean
  notificationSms?: boolean
  notificationPush?: boolean
  weeklyReminderDay?: string
  reminderTime?: string
  accountStatus?: string
  lastLoginAt?: string
}) {
  try {
    const parent = {
      parentId: generateRandomString(12),
      email: parentData.email,
      firstName: parentData.firstName,
      lastName: parentData.lastName,
      phone: parentData.phone,
      role: parentData.role,
      notificationEmail: parentData.notificationEmail,
      notificationSms: parentData.notificationSms,
      notificationPush: parentData.notificationPush,
      weeklyReminderDay: parentData.weeklyReminderDay,
      reminderTime: parentData.reminderTime,
      accountStatus: parentData.accountStatus || 'Active',
      lastLoginAt: parentData.lastLoginAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getParentTable(),
      Item: parent
    })

    const response = await docClient.send(command)
    console.log('creating parent', response)

    return parent
  } catch (error) {
    console.error('Error creating parent:', error)
    throw error
  }
}

export async function deleteParent(parentId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getParentTable(),
      Key: {
        parentId: parentId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting parent', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting parent:', error)
    throw error
  }
}

export async function updateParent(
  parentId: string,
  parentData: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
    role?: string
    notificationEmail?: boolean
    notificationSms?: boolean
    notificationPush?: boolean
    weeklyReminderDay?: string
    reminderTime?: string
    accountStatus?: string
    lastLoginAt?: string
  }
) {
  try {
    const updatableParentData: any = {
      email: parentData.email,
      firstName: parentData.firstName,
      lastName: parentData.lastName,
      phone: parentData.phone,
      role: parentData.role,
      notificationEmail: parentData.notificationEmail,
      notificationSms: parentData.notificationSms,
      notificationPush: parentData.notificationPush,
      weeklyReminderDay: parentData.weeklyReminderDay,
      reminderTime: parentData.reminderTime,
      accountStatus: parentData.accountStatus,
      lastLoginAt: parentData.lastLoginAt
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableParentData).forEach((key, index) => {
      if (updatableParentData[key as keyof typeof updatableParentData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = parentData[key as keyof typeof parentData]
      }
    })

    const command = new UpdateCommand({
      TableName: getParentTable(),
      Key: {
        parentId: parentId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating parent', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating parent:', error)
    throw error
  }
}

export async function getParent(parentId: string) {
  try {
    const command = new GetCommand({
      TableName: getParentTable(),
      Key: {
        parentId: parentId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting parent:', error)
    throw error
  }
}

export async function getAllParents() {
  try {
    const command = new ScanCommand({
      TableName: getParentTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all parents:', error)
    throw error
  }
}

export async function getParentByEmail(email: string) {
  try {
    const command = new QueryCommand({
      TableName: getParentTable(),
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })

    const response = await docClient.send(command)

    return response.Items?.[0] || null
  } catch (error) {
    console.error('Error getting parent by email:', error)
    throw error
  }
}
