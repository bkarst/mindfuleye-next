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

export const getDistrictTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}DistrictDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}DistrictTest`
  } else {
    return `${APP_PREFIX}District`
  }
}


export async function createDistrict(districtData: {
  name: string
  state: string
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZipCode?: string
  contactPhone?: string
  contactEmail?: string
  contactWebsite?: string
}) {
  try {
    const district = {
      districtId: generateRandomString(12),
      name: districtData.name,
      state: districtData.state,
      addressStreet: districtData.addressStreet,
      addressCity: districtData.addressCity,
      addressState: districtData.addressState,
      addressZipCode: districtData.addressZipCode,
      contactPhone: districtData.contactPhone,
      contactEmail: districtData.contactEmail,
      contactWebsite: districtData.contactWebsite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getDistrictTable(),
      Item: district
    })

    const response = await docClient.send(command)
    console.log('creating district', response)

    return district
  } catch (error) {
    console.error('Error creating district:', error)
    throw error
  }
}

export async function deleteDistrict(districtId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getDistrictTable(),
      Key: {
        districtId: districtId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting district', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting district:', error)
    throw error
  }
}

export async function updateDistrict(
  districtId: string,
  districtData: {
    name?: string
    state?: string
    addressStreet?: string
    addressCity?: string
    addressState?: string
    addressZipCode?: string
    contactPhone?: string
    contactEmail?: string
    contactWebsite?: string
  }
) {
  try {
    const updatableDistrictData: any = {
      name: districtData.name,
      state: districtData.state,
      addressStreet: districtData.addressStreet,
      addressCity: districtData.addressCity,
      addressState: districtData.addressState,
      addressZipCode: districtData.addressZipCode,
      contactPhone: districtData.contactPhone,
      contactEmail: districtData.contactEmail,
      contactWebsite: districtData.contactWebsite
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableDistrictData).forEach((key, index) => {
      if (updatableDistrictData[key as keyof typeof updatableDistrictData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = districtData[key as keyof typeof districtData]
      }
    })

    const command = new UpdateCommand({
      TableName: getDistrictTable(),
      Key: {
        districtId: districtId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating district', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating district:', error)
    throw error
  }
}

export async function getDistrict(districtId: string) {
  try {
    const command = new GetCommand({
      TableName: getDistrictTable(),
      Key: {
        districtId: districtId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting district:', error)
    throw error
  }
}

export async function getAllDistricts() {
  try {
    const command = new ScanCommand({
      TableName: getDistrictTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all districts:', error)
    throw error
  }
}

export async function getDistrictsByState(state: string) {
  try {
    const command = new QueryCommand({
      TableName: getDistrictTable(),
      IndexName: 'StateIndex',
      KeyConditionExpression: '#state = :state',
      ExpressionAttributeNames: {
        '#state': 'state'
      },
      ExpressionAttributeValues: {
        ':state': state
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting districts by state:', error)
    throw error
  }
}
