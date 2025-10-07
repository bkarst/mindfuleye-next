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

export const getSchoolTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}SchoolDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}SchoolTest`
  } else {
    return `${APP_PREFIX}School`
  }
}


export async function createSchool(schoolData: {
  districtId: string
  name: string
  level: string
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZipCode?: string
  contactPhone?: string
  contactEmail?: string
  principalName?: string
}) {
  try {
    const school = {
      schoolId: generateRandomString(12),
      districtId: schoolData.districtId,
      name: schoolData.name,
      level: schoolData.level,
      addressStreet: schoolData.addressStreet,
      addressCity: schoolData.addressCity,
      addressState: schoolData.addressState,
      addressZipCode: schoolData.addressZipCode,
      contactPhone: schoolData.contactPhone,
      contactEmail: schoolData.contactEmail,
      principalName: schoolData.principalName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getSchoolTable(),
      Item: school
    })

    const response = await docClient.send(command)
    console.log('creating school', response)

    return school
  } catch (error) {
    console.error('Error creating school:', error)
    throw error
  }
}

export async function deleteSchool(schoolId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getSchoolTable(),
      Key: {
        schoolId: schoolId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting school', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting school:', error)
    throw error
  }
}

export async function updateSchool(
  schoolId: string,
  schoolData: {
    districtId?: string
    name?: string
    level?: string
    addressStreet?: string
    addressCity?: string
    addressState?: string
    addressZipCode?: string
    contactPhone?: string
    contactEmail?: string
    principalName?: string
  }
) {
  try {
    const updatableSchoolData: any = {
      districtId: schoolData.districtId,
      name: schoolData.name,
      level: schoolData.level,
      addressStreet: schoolData.addressStreet,
      addressCity: schoolData.addressCity,
      addressState: schoolData.addressState,
      addressZipCode: schoolData.addressZipCode,
      contactPhone: schoolData.contactPhone,
      contactEmail: schoolData.contactEmail,
      principalName: schoolData.principalName
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableSchoolData).forEach((key, index) => {
      if (updatableSchoolData[key as keyof typeof updatableSchoolData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = schoolData[key as keyof typeof schoolData]
      }
    })

    const command = new UpdateCommand({
      TableName: getSchoolTable(),
      Key: {
        schoolId: schoolId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating school', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating school:', error)
    throw error
  }
}

export async function getSchool(schoolId: string) {
  try {
    const command = new GetCommand({
      TableName: getSchoolTable(),
      Key: {
        schoolId: schoolId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting school:', error)
    throw error
  }
}

export async function getAllSchools() {
  try {
    const command = new ScanCommand({
      TableName: getSchoolTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all schools:', error)
    throw error
  }
}

export async function getSchoolsByDistrict(districtId: string) {
  try {
    const command = new QueryCommand({
      TableName: getSchoolTable(),
      IndexName: 'DistrictSchoolsIndex',
      KeyConditionExpression: 'districtId = :districtId',
      ExpressionAttributeValues: {
        ':districtId': districtId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting schools by district:', error)
    throw error
  }
}

export async function getSchoolsByLevel(level: string) {
  try {
    const command = new QueryCommand({
      TableName: getSchoolTable(),
      IndexName: 'SchoolLevelIndex',
      KeyConditionExpression: '#level = :level',
      ExpressionAttributeNames: {
        '#level': 'level'
      },
      ExpressionAttributeValues: {
        ':level': level
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting schools by level:', error)
    throw error
  }
}
