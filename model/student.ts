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

export const getStudentTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}StudentDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}StudentTest`
  } else {
    return `${APP_PREFIX}Student`
  }
}


export async function createStudent(studentData: {
  schoolId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  grade: string
  nickname?: string
  profileColor?: string
  avatar?: string
  status?: string
  currentWeeklySurvey?: string
}) {
  try {
    const student = {
      studentId: generateRandomString(12),
      schoolId: studentData.schoolId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      dateOfBirth: studentData.dateOfBirth,
      grade: studentData.grade,
      nickname: studentData.nickname,
      profileColor: studentData.profileColor,
      avatar: studentData.avatar,
      status: studentData.status || 'Active',
      currentWeeklySurvey: studentData.currentWeeklySurvey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getStudentTable(),
      Item: student
    })

    const response = await docClient.send(command)
    console.log('creating student', response)

    return student
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getStudentTable(),
      Key: {
        studentId: studentId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting student', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting student:', error)
    throw error
  }
}

export async function updateStudent(
  studentId: string,
  studentData: {
    schoolId?: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    grade?: string
    nickname?: string
    profileColor?: string
    avatar?: string
    status?: string
    currentWeeklySurvey?: string
  }
) {
  try {
    const updatableStudentData: any = {
      schoolId: studentData.schoolId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      dateOfBirth: studentData.dateOfBirth,
      grade: studentData.grade,
      nickname: studentData.nickname,
      profileColor: studentData.profileColor,
      avatar: studentData.avatar,
      status: studentData.status,
      currentWeeklySurvey: studentData.currentWeeklySurvey
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableStudentData).forEach((key, index) => {
      if (updatableStudentData[key as keyof typeof updatableStudentData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = studentData[key as keyof typeof studentData]
      }
    })

    const command = new UpdateCommand({
      TableName: getStudentTable(),
      Key: {
        studentId: studentId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating student', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating student:', error)
    throw error
  }
}

export async function getStudent(studentId: string) {
  try {
    const command = new GetCommand({
      TableName: getStudentTable(),
      Key: {
        studentId: studentId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting student:', error)
    throw error
  }
}

export async function getAllStudents() {
  try {
    const command = new ScanCommand({
      TableName: getStudentTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all students:', error)
    throw error
  }
}

export async function getStudentsBySchool(schoolId: string, grade?: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentTable(),
      IndexName: 'SchoolStudentsIndex',
      KeyConditionExpression: grade
        ? 'schoolId = :schoolId AND grade = :grade'
        : 'schoolId = :schoolId',
      ExpressionAttributeValues: grade
        ? {
            ':schoolId': schoolId,
            ':grade': grade
          }
        : {
            ':schoolId': schoolId
          }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting students by school:', error)
    throw error
  }
}
