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

export const getTeacherSchoolRelationshipTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}TeacherSchoolRelationshipDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}TeacherSchoolRelationshipTest`
  } else {
    return `${APP_PREFIX}TeacherSchoolRelationship`
  }
}

// Helper function to create composite sort key
function createSortKey(schoolId: string, startDate: string): string {
  return `${schoolId}#${startDate}`
}

export async function createTeacherSchoolRelationship(relationshipData: {
  teacherId: string
  schoolId: string
  startDate: string
  endDate?: string
  grades?: string[]
  department?: string
  isCurrent?: boolean
}) {
  try {
    const sortKey = createSortKey(relationshipData.schoolId, relationshipData.startDate)

    const relationship = {
      teacherId: relationshipData.teacherId,
      'schoolId#startDate': sortKey,
      schoolId: relationshipData.schoolId,
      startDate: relationshipData.startDate,
      endDate: relationshipData.endDate,
      grades: relationshipData.grades,
      department: relationshipData.department,
      isCurrent: relationshipData.isCurrent ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      Item: relationship
    })

    const response = await docClient.send(command)
    console.log('creating teacher-school relationship', response)

    return relationship
  } catch (error) {
    console.error('Error creating teacher-school relationship:', error)
    throw error
  }
}

export async function deleteTeacherSchoolRelationship(teacherId: string, schoolId: string, startDate: string) {
  try {
    const sortKey = createSortKey(schoolId, startDate)

    const command = new DeleteCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      Key: {
        teacherId: teacherId,
        'schoolId#startDate': sortKey
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting teacher-school relationship', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting teacher-school relationship:', error)
    throw error
  }
}

export async function updateTeacherSchoolRelationship(
  teacherId: string,
  schoolId: string,
  startDate: string,
  relationshipData: {
    endDate?: string
    grades?: string[]
    department?: string
    isCurrent?: boolean
  }
) {
  try {
    const sortKey = createSortKey(schoolId, startDate)

    const updatableRelationshipData: any = {
      endDate: relationshipData.endDate,
      grades: relationshipData.grades,
      department: relationshipData.department,
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
        expressionAttributeValues[`:${key}`] = relationshipData[key as keyof typeof relationshipData]
      }
    })

    const command = new UpdateCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      Key: {
        teacherId: teacherId,
        'schoolId#startDate': sortKey
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating teacher-school relationship', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating teacher-school relationship:', error)
    throw error
  }
}

export async function getTeacherSchoolRelationship(teacherId: string, schoolId: string, startDate: string) {
  try {
    const sortKey = createSortKey(schoolId, startDate)

    const command = new GetCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      Key: {
        teacherId: teacherId,
        'schoolId#startDate': sortKey
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting teacher-school relationship:', error)
    throw error
  }
}

export async function getAllTeacherSchoolRelationships() {
  try {
    const command = new ScanCommand({
      TableName: getTeacherSchoolRelationshipTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all teacher-school relationships:', error)
    throw error
  }
}

export async function getSchoolsByTeacher(teacherId: string) {
  try {
    const command = new QueryCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      KeyConditionExpression: 'teacherId = :teacherId',
      ExpressionAttributeValues: {
        ':teacherId': teacherId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting schools by teacher:', error)
    throw error
  }
}

export async function getTeachersBySchool(schoolId: string) {
  try {
    const command = new QueryCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      IndexName: 'SchoolTeachersIndex',
      KeyConditionExpression: 'schoolId = :schoolId',
      ExpressionAttributeValues: {
        ':schoolId': schoolId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting teachers by school:', error)
    throw error
  }
}

export async function getCurrentTeachersBySchool(schoolId: string) {
  try {
    const command = new QueryCommand({
      TableName: getTeacherSchoolRelationshipTable(),
      IndexName: 'CurrentTeachersIndex',
      KeyConditionExpression: 'isCurrent = :isCurrent AND schoolId = :schoolId',
      ExpressionAttributeValues: {
        ':isCurrent': true,
        ':schoolId': schoolId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting current teachers by school:', error)
    throw error
  }
}
