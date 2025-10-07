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

export const getStudentSurveyTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}StudentSurveyDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}StudentSurveyTest`
  } else {
    return `${APP_PREFIX}StudentSurvey`
  }
}

export async function createStudentSurvey(surveyData: {
  studentId: string
  parentId: string
  surveyTimestamp: string
  weekNumber: number
  academicProgressJson?: string
  contentConcernsJson?: string
  safetyCheckJson?: string
  behaviorChangesJson?: string
  teacherCommunicationJson?: string
  actionItemsJson?: string
  completionTimeMinutes?: number
  flags?: string[]
  followUpRequired?: boolean
}) {
  try {
    const surveyId = generateRandomString(12)

    const survey = {
      surveyId: surveyId,
      studentId: surveyData.studentId,
      parentId: surveyData.parentId,
      surveyTimestamp: surveyData.surveyTimestamp,
      weekNumber: surveyData.weekNumber,
      academicProgressJson: surveyData.academicProgressJson,
      contentConcernsJson: surveyData.contentConcernsJson,
      safetyCheckJson: surveyData.safetyCheckJson,
      behaviorChangesJson: surveyData.behaviorChangesJson,
      teacherCommunicationJson: surveyData.teacherCommunicationJson,
      actionItemsJson: surveyData.actionItemsJson,
      completionTimeMinutes: surveyData.completionTimeMinutes,
      flags: surveyData.flags || [],
      followUpRequired: surveyData.followUpRequired ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getStudentSurveyTable(),
      Item: survey
    })

    const response = await docClient.send(command)
    console.log('creating student survey', response)

    return survey
  } catch (error) {
    console.error('Error creating student survey:', error)
    throw error
  }
}

export async function deleteStudentSurvey(studentId: string, surveyTimestamp: string) {
  try {
    const command = new DeleteCommand({
      TableName: getStudentSurveyTable(),
      Key: {
        studentId: studentId,
        surveyTimestamp: surveyTimestamp
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting student survey', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting student survey:', error)
    throw error
  }
}

export async function updateStudentSurvey(
  studentId: string,
  surveyTimestamp: string,
  surveyData: {
    academicProgressJson?: string
    contentConcernsJson?: string
    safetyCheckJson?: string
    behaviorChangesJson?: string
    teacherCommunicationJson?: string
    actionItemsJson?: string
    completionTimeMinutes?: number
    flags?: string[]
    followUpRequired?: boolean
  }
) {
  try {
    const updatableSurveyData: any = {
      academicProgressJson: surveyData.academicProgressJson,
      contentConcernsJson: surveyData.contentConcernsJson,
      safetyCheckJson: surveyData.safetyCheckJson,
      behaviorChangesJson: surveyData.behaviorChangesJson,
      teacherCommunicationJson: surveyData.teacherCommunicationJson,
      actionItemsJson: surveyData.actionItemsJson,
      completionTimeMinutes: surveyData.completionTimeMinutes,
      flags: surveyData.flags,
      followUpRequired: surveyData.followUpRequired
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
        expressionAttributeValues[`:${key}`] = surveyData[key as keyof typeof surveyData]
      }
    })

    const command = new UpdateCommand({
      TableName: getStudentSurveyTable(),
      Key: {
        studentId: studentId,
        surveyTimestamp: surveyTimestamp
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating student survey', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating student survey:', error)
    throw error
  }
}

export async function getStudentSurvey(studentId: string, surveyTimestamp: string) {
  try {
    const command = new GetCommand({
      TableName: getStudentSurveyTable(),
      Key: {
        studentId: studentId,
        surveyTimestamp: surveyTimestamp
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting student survey:', error)
    throw error
  }
}

export async function getAllStudentSurveys() {
  try {
    const command = new ScanCommand({
      TableName: getStudentSurveyTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all student surveys:', error)
    throw error
  }
}

export async function getSurveysByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentSurveyTable(),
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      },
      ScanIndexForward: false // Sort by timestamp descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by student:', error)
    throw error
  }
}

export async function getSurveyById(surveyId: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentSurveyTable(),
      IndexName: 'SurveyIdIndex',
      KeyConditionExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Items?.[0] || null
  } catch (error) {
    console.error('Error getting survey by ID:', error)
    throw error
  }
}

export async function getSurveysByParent(parentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentSurveyTable(),
      IndexName: 'ParentSurveysIndex',
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      },
      ScanIndexForward: false // Sort by timestamp descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by parent:', error)
    throw error
  }
}

export async function getSurveysByWeek(weekNumber: number) {
  try {
    const command = new QueryCommand({
      TableName: getStudentSurveyTable(),
      IndexName: 'WeeklyReportsIndex',
      KeyConditionExpression: 'weekNumber = :weekNumber',
      ExpressionAttributeValues: {
        ':weekNumber': weekNumber
      },
      ScanIndexForward: false // Sort by timestamp descending (most recent first)
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by week:', error)
    throw error
  }
}
