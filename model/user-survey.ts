import dotenv from 'dotenv'
// Load environment variables from .env file
dotenv.config()

import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

import { APP_PREFIX, RUNTIME_ENV } from '@/app/constants'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getAllStudents, updateStudent } from './student'
import { getParentsByStudent } from './parent-student-relationship'
import { getAllSurveys } from './survey'

const dyClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})
const docClient = DynamoDBDocumentClient.from(dyClient)

export const getUserSurveyTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}UserSurveyDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}UserSurveyTest`
  } else {
    return `${APP_PREFIX}UserSurvey`
  }
}


export async function createUserSurvey(userSurveyData: {
  parentId: string
  surveyId: string
  studentId: string
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped'
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
  reminderSentAt?: string
  progress?: number
  expiresOn?: string
}) {
  try {
    const userSurvey = {
      parentId: userSurveyData.parentId,
      surveyId: userSurveyData.surveyId,
      studentId: userSurveyData.studentId,
      status: userSurveyData.status,
      startedAt: userSurveyData.startedAt,
      completedAt: userSurveyData.completedAt,
      lastAccessedAt: userSurveyData.lastAccessedAt,
      reminderSentAt: userSurveyData.reminderSentAt,
      progress: userSurveyData.progress || 0,
      expiresOn: userSurveyData.expiresOn,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getUserSurveyTable(),
      Item: userSurvey
    })

    const response = await docClient.send(command)
    console.log('creating user survey', response)

    return userSurvey
  } catch (error) {
    console.error('Error creating user survey:', error)
    throw error
  }
}

export async function deleteUserSurvey(parentId: string, surveyId: string) {
  try {
    const command = new DeleteCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting user survey', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting user survey:', error)
    throw error
  }
}

export async function updateUserSurvey(
  parentId: string,
  surveyId: string,
  userSurveyData: {
    status?: 'Pending' | 'InProgress' | 'Completed' | 'Skipped'
    startedAt?: string
    completedAt?: string
    lastAccessedAt?: string
    reminderSentAt?: string
    progress?: number
    expiresOn?: string
  }
) {
  try {
    const updatableUserSurveyData: any = {
      status: userSurveyData.status,
      startedAt: userSurveyData.startedAt,
      completedAt: userSurveyData.completedAt,
      lastAccessedAt: userSurveyData.lastAccessedAt,
      reminderSentAt: userSurveyData.reminderSentAt,
      progress: userSurveyData.progress,
      expiresOn: userSurveyData.expiresOn
    }

    let updateExpression = 'SET updatedAt = :updatedAt'
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableUserSurveyData).forEach((key, index) => {
      if (updatableUserSurveyData[key as keyof typeof updatableUserSurveyData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = userSurveyData[key as keyof typeof userSurveyData]
      }
    })

    const command = new UpdateCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating user survey', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating user survey:', error)
    throw error
  }
}

export async function getUserSurvey(parentId: string, surveyId: string) {
  try {
    const command = new GetCommand({
      TableName: getUserSurveyTable(),
      Key: {
        parentId: parentId,
        surveyId: surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting user survey:', error)
    throw error
  }
}

export async function getAllUserSurveys() {
  try {
    const command = new ScanCommand({
      TableName: getUserSurveyTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all user surveys:', error)
    throw error
  }
}

export async function getSurveysByParent(parentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by parent:', error)
    throw error
  }
}

export async function getParentsBySurvey(surveyId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      IndexName: 'SurveyParentsIndex',
      KeyConditionExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting parents by survey:', error)
    throw error
  }
}

export async function getSurveysByStudent(studentId: string) {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      IndexName: 'StudentUserSurveysIndex',
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by student:', error)
    throw error
  }
}

export async function getSurveysByStatus(status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped') {
  try {
    const command = new QueryCommand({
      TableName: getUserSurveyTable(),
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status
      }
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting surveys by status:', error)
    throw error
  }
}

/**
 * Helper function: Convert a date to a unique week string in format YYYY-WW
 * @param date - The date to convert (defaults to current date)
 * @returns String in format YYYY-WW (e.g., "2025-42")
 */
export function timeToUniqueWeekString(date: Date = new Date()): string {
  const year = date.getFullYear()

  // Calculate week number (ISO 8601 week numbering)
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)

  return `${year}-${String(weekNumber).padStart(2, '0')}`
}

/**
 * Helper function: Calculate the expiration date for a survey (6 days from start of week)
 * @param weekString - The week string in format YYYY-WW
 * @returns ISO 8601 date string for expiration (end of the 6th day)
 */
export function calculateExpiresOn(weekString: string): string {
  const [yearStr, weekStr] = weekString.split('-')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)

  // Calculate the start of the week
  const startOfYear = new Date(year, 0, 1)
  const daysToAdd = (week - 1) * 7 - startOfYear.getDay()
  const weekStart = new Date(year, 0, 1 + daysToAdd)

  // Add 6 days (survey available for 6 days)
  const expirationDate = new Date(weekStart)
  expirationDate.setDate(weekStart.getDate() + 6)
  expirationDate.setHours(23, 59, 59, 999) // End of the 6th day

  return expirationDate.toISOString()
}

/**
 * Periodic task: Create new user surveys for each student with parents
 * This should be run weekly to assign surveys to parents for their children
 */
export async function createNewUserSurveys() {
  try {
    console.log('Starting createNewUserSurveys task...')

    const currentWeekString = timeToUniqueWeekString()
    const expiresOn = calculateExpiresOn(currentWeekString)

    console.log(`Current week: ${currentWeekString}, Expires: ${expiresOn}`)

    // Get all students
    const students = await getAllStudents()
    console.log(`Found ${students.length} students`)

    // Get all surveys to match with grades
    const surveys = await getAllSurveys()
    const activeSurveys = surveys.filter((s: any) => s.isActive === 'true' && s.surveyType === 'Weekly')
    console.log(`Found ${activeSurveys.length} active weekly surveys`)

    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const student of students) {
      try {
        // Check if student has a currentWeeklySurvey set
        if (!student.currentWeeklySurvey) {
          console.log(`Student ${student.studentId} (${student.firstName} ${student.lastName}) does not have currentWeeklySurvey set. Attempting to find survey by grade...`)

          // Try to find survey by student's grade
          const matchingSurvey = activeSurveys.find((survey: any) =>
            survey.grade_level === student.grade
          )

          if (!matchingSurvey) {
            console.error(`No weekly survey found for student ${student.studentId} with grade ${student.grade}`)
            errorCount++
            continue
          }

          console.log(`Found matching survey ${matchingSurvey.surveyId} for grade ${student.grade}`)

          // Update the student's currentWeeklySurvey in the database
          await updateStudent(student.studentId, {
            currentWeeklySurvey: matchingSurvey.surveyId
          })

          student.currentWeeklySurvey = matchingSurvey.surveyId
          console.log(`Updated student ${student.studentId} with currentWeeklySurvey: ${matchingSurvey.surveyId}`)
        }

        const surveyId = student.currentWeeklySurvey

        // Get all parents for this student
        const parentRelationships = await getParentsByStudent(student.studentId)

        if (parentRelationships.length === 0) {
          console.log(`Student ${student.studentId} has no parents assigned. Skipping.`)
          skippedCount++
          continue
        }

        console.log(`Student ${student.studentId} has ${parentRelationships.length} parent(s)`)

        // Create user-survey for each parent
        for (const relationship of parentRelationships) {
          const parentId = relationship.parentId

          // Create a composite surveyId that includes the week identifier
          const weeklySurveyId = `${surveyId}#${currentWeekString}`

          // Check if user-survey already exists for this week
          const existingSurvey = await getUserSurvey(parentId, weeklySurveyId)

          if (existingSurvey) {
            console.log(`User survey already exists for parent ${parentId}, student ${student.studentId}, week ${currentWeekString}. Skipping.`)
            skippedCount++
            continue
          }

          // Create new user-survey
          await createUserSurvey({
            parentId: parentId,
            surveyId: weeklySurveyId,
            studentId: student.studentId,
            status: 'Pending',
            expiresOn: expiresOn
          })

          createdCount++
          console.log(`Created user survey for parent ${parentId}, student ${student.studentId}, week ${currentWeekString}`)
        }
      } catch (error) {
        errorCount++
        console.error(`Error processing student ${student.studentId}:`, error)
      }
    }

    console.log(`\nCreateNewUserSurveys task completed:`)
    console.log(`  Created: ${createdCount}`)
    console.log(`  Skipped: ${skippedCount}`)
    console.log(`  Errors: ${errorCount}`)

    return {
      success: true,
      created: createdCount,
      skipped: skippedCount,
      errors: errorCount,
      week: currentWeekString
    }
  } catch (error) {
    console.error('Error in createNewUserSurveys task:', error)
    throw error
  }
}
