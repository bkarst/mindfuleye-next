import dotenv from 'dotenv'
// Load environment variables from .env file
dotenv.config()

import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

import { APP_PREFIX, RUNTIME_ENV } from '@/app/constants'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const dyClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})
const docClient = DynamoDBDocumentClient.from(dyClient)

export const getUserSurveyTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}UserSurveyDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}UserSurveyTest`
  } else {
    return `${APP_PREFIX}UserSurvey`
  }
}


export async function createUserSurvey(userSurveyData: {
  parentId: string
  surveyId: string
  studentId: string
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped'
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
  reminderSentAt?: string
  progress?: number
}) {
  try {
    const userSurvey = {
      parentId: userSurveyData.parentId,
      surveyId: userSurveyData.surveyId,
      studentId: userSurveyData.studentId,
      status: userSurveyData.status,
      startedAt: userSurveyData.startedAt,
      completedAt: userSurveyData.completedAt,
      lastAccessedAt: userSurveyData.lastAccessedAt,
      reminderSentAt: userSurveyData.reminderSentAt,
      progress: userSurveyData.progress || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getUserSurveyTable(),
      Item: userSurvey
    })

    const response = await docClient.send(command)
    console.log('creating user survey', response)

    return userSurvey
  } catch (error) {
    console.error('Error creating user survey:', error)
    throw error
  }
}

export async function deleteUserSurvey(parentId: string, surveyId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting user survey', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting user survey:', error)
    throw error
  }
}

export async function updateUserSurvey(
  parentId: string,
  surveyId: string,
  userSurveyData: {
    status?: 'Pending' | 'InProgress' | 'Completed' | 'Skipped'
    startedAt?: string
    completedAt?: string
    lastAccessedAt?: string
    reminderSentAt?: string
    progress?: number
  }
) {
  try {
    const updatableUserSurveyData: any = {
      status: userSurveyData.status,
      startedAt: userSurveyData.startedAt,
      completedAt: userSurveyData.completedAt,
      lastAccessedAt: userSurveyData.lastAccessedAt,
      reminderSentAt: userSurveyData.reminderSentAt,
      progress: userSurveyData.progress
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableUserSurveyData).forEach((key, index) => {
      if (updatableUserSurveyData[key as keyof typeof updatableUserSurveyData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = userSurveyData[key as keyof typeof userSurveyData]
      }
    })

    const command = new UpdateCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating user survey', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating user survey:', error)
    throw error
  }
}

export async function getUserSurvey(parentId: string, surveyId: string) {
  try {
    const command = new GetCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting user survey:', error)
    throw error
  }
}

export async function getAllUserSurveys() {
  try {
    const command = new ScanCommand({
      TableName: getUserSurveyTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all user surveys:', error)
    throw error
  }
}

export async function getSurveysByParent(parentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by parent:', error)
    throw error
  }
}

export async function getParentsBySurvey(surveyId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      IndexName: 'SurveyParentsIndex',
      KeyConditionExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting parents by survey:', error)
    throw error
  }
}

export async function getSurveysByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      IndexName: 'StudentUserSurveysIndex',
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by student:', error)
    throw error
  }
}

export async function getSurveysByStatus(status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped') {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
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
    console.error('Error getting surveys by status:', error)
    throw error
  }
}
