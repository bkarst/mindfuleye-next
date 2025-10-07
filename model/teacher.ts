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

export const getTeacherTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}TeacherDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}TeacherTest`
  } else {
    return `${APP_PREFIX}Teacher`
  }
}


export async function createTeacher(teacherData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subjects?: string[]
  status?: string
}) {
  try {
    const teacher = {
      teacherId: generateRandomString(12),
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      phone: teacherData.phone,
      subjects: teacherData.subjects,
      status: teacherData.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getTeacherTable(),
      Item: teacher
    })

    const response = await docClient.send(command)
    console.log('creating teacher', response)

    return teacher
  } catch (error) {
    console.error('Error creating teacher:', error)
    throw error
  }
}

export async function deleteTeacher(teacherId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getTeacherTable(),
      Key: {
        teacherId: teacherId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting teacher', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting teacher:', error)
    throw error
  }
}

export async function updateTeacher(
  teacherId: string,
  teacherData: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    subjects?: string[]
    status?: string
  }
) {
  try {
    const updatableTeacherData: any = {
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      phone: teacherData.phone,
      subjects: teacherData.subjects,
      status: teacherData.status
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableTeacherData).forEach((key, index) => {
      if (updatableTeacherData[key as keyof typeof updatableTeacherData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = teacherData[key as keyof typeof teacherData]
      }
    })

    const command = new UpdateCommand({
      TableName: getTeacherTable(),
      Key: {
        teacherId: teacherId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating teacher', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating teacher:', error)
    throw error
  }
}

export async function getTeacher(teacherId: string) {
  try {
    const command = new GetCommand({
      TableName: getTeacherTable(),
      Key: {
        teacherId: teacherId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting teacher:', error)
    throw error
  }
}

export async function getAllTeachers() {
  try {
    const command = new ScanCommand({
      TableName: getTeacherTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all teachers:', error)
    throw error
  }
}

export async function getTeacherByEmail(email: string) {
  try {
    const command = new QueryCommand({
      TableName: getTeacherTable(),
      IndexName: 'TeacherEmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })

    const response = await docClient.send(command)

    return response.Items?.[0] || null
  } catch (error) {
    console.error('Error getting teacher by email:', error)
    throw error
  }
}
