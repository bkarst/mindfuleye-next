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

export const getSurveyNotificationTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}SurveyNotificationDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}SurveyNotificationTest`
  } else {
    return `${APP_PREFIX}SurveyNotification`
  }
}


export async function createSurveyNotification(notificationData: {
  parentId: string
  studentId: string
  surveyId: string
  surveyInstanceId?: string
  scheduledDate: string
  scheduledTime: string
  weekNumber: number
  notificationType: string
  status: string
  subject: string
  message: string
  templateId?: string
  metadata?: string
}) {
  try {
    const notificationId = generateRandomString(12)
    const sortKey = `${notificationData.scheduledDate}#${notificationId}`
    const scheduledDateTime = `${notificationData.scheduledDate}#${notificationData.scheduledTime}`

    const notification = {
      notificationId,
      parentId: notificationData.parentId,
      studentId: notificationData.studentId,
      surveyId: notificationData.surveyId,
      surveyInstanceId: notificationData.surveyInstanceId,
      sortKey,
      scheduledDate: notificationData.scheduledDate,
      scheduledTime: notificationData.scheduledTime,
      scheduledDateTime,
      weekNumber: notificationData.weekNumber,
      notificationType: notificationData.notificationType,
      status: notificationData.status,
      subject: notificationData.subject,
      message: notificationData.message,
      templateId: notificationData.templateId,
      sentAt: undefined,
      deliveredAt: undefined,
      failedAt: undefined,
      attemptCount: 0,
      lastError: undefined,
      nextRetryAt: undefined,
      metadata: notificationData.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getSurveyNotificationTable(),
      Item: notification
    })

    const response = await docClient.send(command)
    console.log('creating survey notification', response)

    return notification
  } catch (error) {
    console.error('Error creating survey notification:', error)
    throw error
  }
}

export async function deleteSurveyNotification(parentId: string, sortKey: string) {
  try {
    const command = new DeleteCommand({
      TableName: getSurveyNotificationTable(),
      Key: {
        parentId: parentId,
        sortKey: sortKey
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting survey notification', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting survey notification:', error)
    throw error
  }
}

export async function updateSurveyNotification(
  parentId: string,
  sortKey: string,
  notificationData: {
    surveyInstanceId?: string
    status?: string
    sentAt?: string
    deliveredAt?: string
    failedAt?: string
    attemptCount?: number
    lastError?: string
    nextRetryAt?: string
    metadata?: string
  }
) {
  try {
    const updatableNotificationData: any = {
      surveyInstanceId: notificationData.surveyInstanceId,
      status: notificationData.status,
      sentAt: notificationData.sentAt,
      deliveredAt: notificationData.deliveredAt,
      failedAt: notificationData.failedAt,
      attemptCount: notificationData.attemptCount,
      lastError: notificationData.lastError,
      nextRetryAt: notificationData.nextRetryAt,
      metadata: notificationData.metadata
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableNotificationData).forEach((key, index) => {
      if (updatableNotificationData[key as keyof typeof updatableNotificationData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = notificationData[key as keyof typeof notificationData]
      }
    })

    const command = new UpdateCommand({
      TableName: getSurveyNotificationTable(),
      Key: {
        parentId: parentId,
        sortKey: sortKey
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating survey notification', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating survey notification:', error)
    throw error
  }
}

export async function getSurveyNotification(parentId: string, sortKey: string) {
  try {
    const command = new GetCommand({
      TableName: getSurveyNotificationTable(),
      Key: {
        parentId: parentId,
        sortKey: sortKey
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting survey notification:', error)
    throw error
  }
}

export async function getNotificationsByParent(parentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyNotificationTable(),
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting notifications by parent:', error)
    throw error
  }
}

export async function getNotificationsByScheduledDate(scheduledDate: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyNotificationTable(),
      IndexName: 'ScheduledDateIndex',
      KeyConditionExpression: 'scheduledDate = :scheduledDate',
      ExpressionAttributeValues: {
        ':scheduledDate': scheduledDate
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting notifications by scheduled date:', error)
    throw error
  }
}

export async function getNotificationsByStatus(status: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyNotificationTable(),
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting notifications by status:', error)
    throw error
  }
}

export async function getNotificationsByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyNotificationTable(),
      IndexName: 'StudentNotificationsIndex',
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting notifications by student:', error)
    throw error
  }
}

export async function getNotificationsBySurveyInstance(surveyInstanceId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyNotificationTable(),
      IndexName: 'SurveyInstanceIndex',
      KeyConditionExpression: 'surveyInstanceId = :surveyInstanceId',
      ExpressionAttributeValues: {
        ':surveyInstanceId': surveyInstanceId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting notifications by survey instance:', error)
    throw error
  }
}
