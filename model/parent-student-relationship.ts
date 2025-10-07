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

export const getParentStudentRelationshipTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}ParentStudentRelationshipDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}ParentStudentRelationshipTest`
  } else {
    return `${APP_PREFIX}ParentStudentRelationship`
  }
}


export async function createParentStudentRelationship(relationshipData: {
  parentId: string
  studentId: string
  relationship: string
  isPrimaryContact?: boolean
  canViewSurveys?: boolean
  canEditProfile?: boolean
  canReceiveAlerts?: boolean
}) {
  try {
    const relationship = {
      parentId: relationshipData.parentId,
      studentId: relationshipData.studentId,
      relationship: relationshipData.relationship,
      isPrimaryContact: relationshipData.isPrimaryContact ?? false,
      canViewSurveys: relationshipData.canViewSurveys ?? true,
      canEditProfile: relationshipData.canEditProfile ?? false,
      canReceiveAlerts: relationshipData.canReceiveAlerts ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getParentStudentRelationshipTable(),
      Item: relationship
    })

    const response = await docClient.send(command)
    console.log('creating parent-student relationship', response)

    return relationship
  } catch (error) {
    console.error('Error creating parent-student relationship:', error)
    throw error
  }
}

export async function deleteParentStudentRelationship(parentId: string, studentId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getParentStudentRelationshipTable(),
      Key: {
        parentId: parentId,
        studentId: studentId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting parent-student relationship', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting parent-student relationship:', error)
    throw error
  }
}

export async function updateParentStudentRelationship(
  parentId: string,
  studentId: string,
  relationshipData: {
    relationship?: string
    isPrimaryContact?: boolean
    canViewSurveys?: boolean
    canEditProfile?: boolean
    canReceiveAlerts?: boolean
  }
) {
  try {
    const updatableRelationshipData: any = {
      relationship: relationshipData.relationship,
      isPrimaryContact: relationshipData.isPrimaryContact,
      canViewSurveys: relationshipData.canViewSurveys,
      canEditProfile: relationshipData.canEditProfile,
      canReceiveAlerts: relationshipData.canReceiveAlerts
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
      TableName: getParentStudentRelationshipTable(),
      Key: {
        parentId: parentId,
        studentId: studentId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating parent-student relationship', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating parent-student relationship:', error)
    throw error
  }
}

export async function getParentStudentRelationship(parentId: string, studentId: string) {
  try {
    const command = new GetCommand({
      TableName: getParentStudentRelationshipTable(),
      Key: {
        parentId: parentId,
        studentId: studentId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting parent-student relationship:', error)
    throw error
  }
}

export async function getAllParentStudentRelationships() {
  try {
    const command = new ScanCommand({
      TableName: getParentStudentRelationshipTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all parent-student relationships:', error)
    throw error
  }
}

export async function getStudentsByParent(parentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getParentStudentRelationshipTable(),
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting students by parent:', error)
    throw error
  }
}

export async function getParentsByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getParentStudentRelationshipTable(),
      IndexName: 'StudentParentsIndex',
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting parents by student:', error)
    throw error
  }
}
