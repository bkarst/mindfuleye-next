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

export const getSurveyQuestionTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}SurveyQuestionDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}SurveyQuestionTest`
  } else {
    return `${APP_PREFIX}SurveyQuestion`
  }
}


export async function createSurveyQuestion(questionData: {
  surveyId: string
  questionText: string
  questionCategory: string
  responseType: 'Text' | 'Number' | 'Boolean' | 'Scale' | 'MultipleChoice' | 'Checkbox'
  orderIndex: number
  isRequired: boolean
  isActive: boolean
  questionOptions?: string[]
  helperText?: string
  sectionName?: string
  conditionalLogic?: string
}) {
  try {
    const questionId = generateRandomString(12)
    const orderIndexPadded = String(questionData.orderIndex).padStart(3, '0')
    const sortKey = `${orderIndexPadded}#${questionId}`

    const surveyQuestion = {
      surveyId: questionData.surveyId,
      sortKey: sortKey,
      questionId: questionId,
      questionText: questionData.questionText,
      questionCategory: questionData.questionCategory,
      responseType: questionData.responseType,
      orderIndex: questionData.orderIndex,
      isRequired: String(questionData.isRequired),
      isActive: String(questionData.isActive),
      questionOptions: questionData.questionOptions,
      helperText: questionData.helperText,
      sectionName: questionData.sectionName,
      conditionalLogic: questionData.conditionalLogic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getSurveyQuestionTable(),
      Item: surveyQuestion
    })

    const response = await docClient.send(command)
    console.log('creating survey question', response)

    return surveyQuestion
  } catch (error) {
    console.error('Error creating survey question:', error)
    throw error
  }
}

export async function deleteSurveyQuestion(surveyId: string, sortKey: string) {
  try {
    const command = new DeleteCommand({
      TableName: getSurveyQuestionTable(),
      Key: {
        surveyId: surveyId,
        sortKey: sortKey
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting survey question', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting survey question:', error)
    throw error
  }
}

export async function updateSurveyQuestion(
  surveyId: string,
  sortKey: string,
  questionData: {
    questionText?: string
    questionCategory?: string
    responseType?: 'Text' | 'Number' | 'Boolean' | 'Scale' | 'MultipleChoice' | 'Checkbox'
    orderIndex?: number
    isRequired?: boolean
    isActive?: boolean
    questionOptions?: string[]
    helperText?: string
    sectionName?: string
    conditionalLogic?: string
  }
) {
  try {
    const updatableQuestionData: any = {
      questionText: questionData.questionText,
      questionCategory: questionData.questionCategory,
      responseType: questionData.responseType,
      orderIndex: questionData.orderIndex,
      isRequired: questionData.isRequired !== undefined ? String(questionData.isRequired) : undefined,
      isActive: questionData.isActive !== undefined ? String(questionData.isActive) : undefined,
      questionOptions: questionData.questionOptions,
      helperText: questionData.helperText,
      sectionName: questionData.sectionName,
      conditionalLogic: questionData.conditionalLogic
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableQuestionData).forEach((key, index) => {
      if (updatableQuestionData[key as keyof typeof updatableQuestionData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = updatableQuestionData[key as keyof typeof updatableQuestionData]
      }
    })

    const command = new UpdateCommand({
      TableName: getSurveyQuestionTable(),
      Key: {
        surveyId: surveyId,
        sortKey: sortKey
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating survey question', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating survey question:', error)
    throw error
  }
}

export async function getSurveyQuestion(surveyId: string, sortKey: string) {
  try {
    const command = new GetCommand({
      TableName: getSurveyQuestionTable(),
      Key: {
        surveyId: surveyId,
        sortKey: sortKey
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting survey question:', error)
    throw error
  }
}

export async function getQuestionsBySurvey(surveyId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyQuestionTable(),
      KeyConditionExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting questions by survey:', error)
    throw error
  }
}

export async function getAllSurveyQuestions() {
  try {
    const command = new ScanCommand({
      TableName: getSurveyQuestionTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all survey questions:', error)
    throw error
  }
}

export async function getQuestionsByCategory(category: string) {
  try {
    const command = new QueryCommand({
      TableName: getSurveyQuestionTable(),
      IndexName: 'CategoryOrderIndex',
      KeyConditionExpression: 'questionCategory = :category',
      ExpressionAttributeValues: {
        ':category': category
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting questions by category:', error)
    throw error
  }
}

export async function getActiveQuestions() {
  try {
    const command = new QueryCommand({
      TableName: getSurveyQuestionTable(),
      IndexName: 'ActiveQuestionsIndex',
      KeyConditionExpression: 'isActive = :isActive',
      ExpressionAttributeValues: {
        ':isActive': 'true'
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting active questions:', error)
    throw error
  }
}
