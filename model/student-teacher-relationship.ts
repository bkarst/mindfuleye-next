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

export const getStudentTeacherRelationshipTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}StudentTeacherRelationshipDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}StudentTeacherRelationshipTest`
  } else {
    return `${APP_PREFIX}StudentTeacherRelationship`
  }
}

// Helper function to create composite sort key
function createSortKey(teacherId: string, academicYear: string): string {
  return `${teacherId}#${academicYear}`
}

export async function createStudentTeacherRelationship(relationshipData: {
  studentId: string
  teacherId: string
  academicYear: string
  subject?: string
  gradeLevel?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
}) {
  try {
    const sortKey = createSortKey(relationshipData.teacherId, relationshipData.academicYear)

    const relationship = {
      studentId: relationshipData.studentId,
      teacherIdAcademicYear: sortKey,
      teacherId: relationshipData.teacherId,
      academicYear: relationshipData.academicYear,
      subject: relationshipData.subject,
      gradeLevel: relationshipData.gradeLevel,
      startDate: relationshipData.startDate,
      endDate: relationshipData.endDate,
      isCurrent: relationshipData.isCurrent ?? true ? 'true' : 'false',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getStudentTeacherRelationshipTable(),
      Item: relationship
    })

    const response = await docClient.send(command)
    console.log('creating student-teacher relationship', response)

    return relationship
  } catch (error) {
    console.error('Error creating student-teacher relationship:', error)
    throw error
  }
}

export async function deleteStudentTeacherRelationship(studentId: string, teacherId: string, academicYear: string) {
  try {
    const sortKey = createSortKey(teacherId, academicYear)

    const command = new DeleteCommand({
      TableName: getStudentTeacherRelationshipTable(),
      Key: {
        studentId: studentId,
        teacherIdAcademicYear: sortKey
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting student-teacher relationship', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting student-teacher relationship:', error)
    throw error
  }
}

export async function updateStudentTeacherRelationship(
  studentId: string,
  teacherId: string,
  academicYear: string,
  relationshipData: {
    subject?: string
    gradeLevel?: string
    endDate?: string
    isCurrent?: boolean
  }
) {
  try {
    const sortKey = createSortKey(teacherId, academicYear)

    const updatableRelationshipData: any = {
      subject: relationshipData.subject,
      gradeLevel: relationshipData.gradeLevel,
      endDate: relationshipData.endDate,
      isCurrent: relationshipData.isCurrent
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableRelationshipData).forEach((key, index) => {
      if (updatableRelationshipData[key as keyof typeof updatableRelationshipData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        // Convert isCurrent boolean to string for DynamoDB
        if (key === 'isCurrent' && typeof relationshipData.isCurrent === 'boolean') {
          expressionAttributeValues[`:${key}`] = relationshipData.isCurrent ? 'true' : 'false'
        } else {
          expressionAttributeValues[`:${key}`] = relationshipData[key as keyof typeof relationshipData]
        }
      }
    })

    const command = new UpdateCommand({
      TableName: getStudentTeacherRelationshipTable(),
      Key: {
        studentId: studentId,
        teacherIdAcademicYear: sortKey
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating student-teacher relationship', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating student-teacher relationship:', error)
    throw error
  }
}

export async function getStudentTeacherRelationship(studentId: string, teacherId: string, academicYear: string) {
  try {
    const sortKey = createSortKey(teacherId, academicYear)

    const command = new GetCommand({
      TableName: getStudentTeacherRelationshipTable(),
      Key: {
        studentId: studentId,
        teacherIdAcademicYear: sortKey
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting student-teacher relationship:', error)
    throw error
  }
}

export async function getAllStudentTeacherRelationships() {
  try {
    const command = new ScanCommand({
      TableName: getStudentTeacherRelationshipTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all student-teacher relationships:', error)
    throw error
  }
}

export async function getTeachersByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentTeacherRelationshipTable(),
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting teachers by student:', error)
    throw error
  }
}

export async function getStudentsByTeacher(teacherId: string, academicYear?: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentTeacherRelationshipTable(),
      IndexName: 'TeacherStudentsIndex',
      KeyConditionExpression: academicYear
        ? 'teacherId = :teacherId AND academicYear = :academicYear'
        : 'teacherId = :teacherId',
      ExpressionAttributeValues: academicYear
        ? {
            ':teacherId': teacherId,
            ':academicYear': academicYear
          }
        : {
            ':teacherId': teacherId
          }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting students by teacher:', error)
    throw error
  }
}

export async function getCurrentAssignments(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getStudentTeacherRelationshipTable(),
      IndexName: 'CurrentAssignmentsIndex',
      KeyConditionExpression: 'isCurrent = :isCurrent AND studentId = :studentId',
      ExpressionAttributeValues: {
        ':isCurrent': 'true',
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting current assignments:', error)
    throw error
  }
}
