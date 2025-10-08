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

export const getSurveyTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}SurveyDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}SurveyTest`
  } else {
    return `${APP_PREFIX}Survey`
  }
}


export async function createSurvey(surveyData: {
  name: string
  grade_level?: string
  description?: string
  surveyType: string
  targetAudience?: string
  isActive?: boolean
  version?: number
  instructions?: string
  createdBy?: string
}) {
  try {
    const isActive = surveyData.isActive !== undefined ? surveyData.isActive : true
    const survey = {
      surveyId: generateRandomString(12),
      name: surveyData.name,
      grade_level: surveyData.grade_level,
      description: surveyData.description,
      surveyType: surveyData.surveyType,
      targetAudience: surveyData.targetAudience,
      isActive: String(isActive), // Store as string for GSI compatibility
      version: surveyData.version || 1,
      instructions: surveyData.instructions,
      createdBy: surveyData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getSurveyTable(),
      Item: survey
    })

    const response = await docClient.send(command)
    console.log('creating survey', response)

    return survey
  } catch (error) {
    console.error('Error creating survey:', error)
    throw error
  }
}

export async function deleteSurvey(surveyId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getSurveyTable(),
      Key: {
        surveyId: surveyId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting survey', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting survey:', error)
    throw error
  }
}

export async function updateSurvey(
  surveyId: string,
  surveyData: {
    name?: string
    grade_level?: string
    description?: string
    surveyType?: string
    targetAudience?: string
    isActive?: boolean
    version?: number
    instructions?: string
    createdBy?: string
  }
) {
  try {
    const updatableSurveyData: any = {
      name: surveyData.name,
      grade_level: surveyData.grade_level,
      description: surveyData.description,
      surveyType: surveyData.surveyType,
      targetAudience: surveyData.targetAudience,
      isActive: surveyData.isActive,
      version: surveyData.version,
      instructions: surveyData.instructions,
      createdBy: surveyData.createdBy
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableSurveyData).forEach((key, index) => {
      if (updatableSurveyData[key as keyof typeof updatableSurveyData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        // Convert boolean to string for isActive to match GSI type
        const value = key === 'isActive' && typeof surveyData[key as keyof typeof surveyData] === 'boolean'
          ? String(surveyData[key as keyof typeof surveyData])
          : surveyData[key as keyof typeof surveyData]
        expressionAttributeValues[`:${key}`] = value
      }
    })

    const command = new UpdateCommand({
      TableName: getSurveyTable(),
      Key: {
        surveyId: surveyId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating survey', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating survey:', error)
    throw error
  }
}

export async function getSurvey(surveyId: string) {
  try {
    const command = new GetCommand({
      TableName: getSurveyTable(),
      Key: {
        surveyId: surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting survey:', error)
    throw error
  }
}

export async function getAllSurveys() {
  try {
    const command = new ScanCommand({
      TableName: getSurveyTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all surveys:', error)
    throw error
  }
}

export async function getActiveSurveys(surveyType?: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyTable(),
      IndexName: 'ActiveSurveysIndex',
      KeyConditionExpression: surveyType
        ? 'isActive = :isActive AND surveyType = :surveyType'
        : 'isActive = :isActive',
      ExpressionAttributeValues: surveyType
        ? {
            ':isActive': 'true', // Use string for GSI compatibility
            ':surveyType': surveyType
          }
        : {
            ':isActive': 'true' // Use string for GSI compatibility
          }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting active surveys:', error)
    throw error
  }
}

export async function getSurveysByType(surveyType: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyTable(),
      IndexName: 'SurveyTypeIndex',
      KeyConditionExpression: 'surveyType = :surveyType',
      ExpressionAttributeValues: {
        ':surveyType': surveyType
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by type:', error)
    throw error
  }
}
