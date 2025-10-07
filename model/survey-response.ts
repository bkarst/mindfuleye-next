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

export const getSurveyResponseTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}SurveyResponseDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}SurveyResponseTest`
  } else {
    return `${APP_PREFIX}SurveyResponse`
  }
}

export async function createSurveyResponse(responseData: {
  surveyId: string
  questionId: string
  studentId: string
  parentId: string
  questionText: string
  questionCategory: string
  responseType: string
  responseValue: string
  responseNumeric?: number
  responseBoolean?: boolean
  concernLevel?: string
  requiresFollowUp?: boolean
  notes?: string
  answeredAt: string
}) {
  try {
    const response = {
      surveyId: responseData.surveyId,
      questionId: responseData.questionId,
      studentId: responseData.studentId,
      parentId: responseData.parentId,
      questionText: responseData.questionText,
      questionCategory: responseData.questionCategory,
      responseType: responseData.responseType,
      responseValue: responseData.responseValue,
      responseNumeric: responseData.responseNumeric,
      responseBoolean: responseData.responseBoolean,
      concernLevel: responseData.concernLevel || 'None',
      requiresFollowUp: responseData.requiresFollowUp ?? false,
      notes: responseData.notes,
      answeredAt: responseData.answeredAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getSurveyResponseTable(),
      Item: response
    })

    const commandResponse = await docClient.send(command)
    console.log('creating survey response', commandResponse)

    return response
  } catch (error) {
    console.error('Error creating survey response:', error)
    throw error
  }
}

export async function deleteSurveyResponse(surveyId: string, questionId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getSurveyResponseTable(),
      Key: {
        surveyId: surveyId,
        questionId: questionId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting survey response', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting survey response:', error)
    throw error
  }
}

export async function updateSurveyResponse(
  surveyId: string,
  questionId: string,
  responseData: {
    responseValue?: string
    responseNumeric?: number
    responseBoolean?: boolean
    concernLevel?: string
    requiresFollowUp?: boolean
    notes?: string
  }
) {
  try {
    const updatableResponseData: any = {
      responseValue: responseData.responseValue,
      responseNumeric: responseData.responseNumeric,
      responseBoolean: responseData.responseBoolean,
      concernLevel: responseData.concernLevel,
      requiresFollowUp: responseData.requiresFollowUp,
      notes: responseData.notes
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableResponseData).forEach((key, index) => {
      if (updatableResponseData[key as keyof typeof updatableResponseData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = responseData[key as keyof typeof responseData]
      }
    })

    const command = new UpdateCommand({
      TableName: getSurveyResponseTable(),
      Key: {
        surveyId: surveyId,
        questionId: questionId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating survey response', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating survey response:', error)
    throw error
  }
}

export async function getSurveyResponse(surveyId: string, questionId: string) {
  try {
    const command = new GetCommand({
      TableName: getSurveyResponseTable(),
      Key: {
        surveyId: surveyId,
        questionId: questionId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting survey response:', error)
    throw error
  }
}

export async function getAllSurveyResponses() {
  try {
    const command = new ScanCommand({
      TableName: getSurveyResponseTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all survey responses:', error)
    throw error
  }
}

export async function getResponsesBySurvey(surveyId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyResponseTable(),
      KeyConditionExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting responses by survey:', error)
    throw error
  }
}

export async function getResponsesByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyResponseTable(),
      IndexName: 'StudentResponsesIndex',
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      },
      ScanIndexForward: false // Sort by answeredAt descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting responses by student:', error)
    throw error
  }
}

export async function getResponsesByCategory(questionCategory: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyResponseTable(),
      IndexName: 'QuestionCategoryIndex',
      KeyConditionExpression: 'questionCategory = :questionCategory',
      ExpressionAttributeValues: {
        ':questionCategory': questionCategory
      },
      ScanIndexForward: false // Sort by answeredAt descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting responses by category:', error)
    throw error
  }
}

export async function getResponsesByConcernLevel(concernLevel: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyResponseTable(),
      IndexName: 'ConcernLevelIndex',
      KeyConditionExpression: 'concernLevel = :concernLevel',
      ExpressionAttributeValues: {
        ':concernLevel': concernLevel
      },
      ScanIndexForward: false // Sort by answeredAt descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting responses by concern level:', error)
    throw error
  }
}
