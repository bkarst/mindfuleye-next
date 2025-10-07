
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

export const getCourseTable = () => {
  if (RUNTIME_ENV == 'development') {
    return `${APP_PREFIX}CourseDevelopment`
  } else if (RUNTIME_ENV == 'test') {
    return `${APP_PREFIX}CourseTest`
  } else {
    return `${APP_PREFIX}Course`
  }
}


export async function createCourse(courseData: {
  bot_personality_description?: string
  avatar_url?: string
  stripe_checkout_link_test?: string
  stripe_checkout_link_production?: string
  is_onboarding?: boolean
  description?: string
  short_description?: string
  author?: string
  price?: number
  is_free?: boolean
  course_type?: string
  slug: string
  background_image_url?: string
  is_launched?: boolean
  featured_order?: number
  name?: string
  bot_name?: string
  course_completed_message?: string
  completion_callback_path?: string
  bot_id?: string
}) {
  try {
    const course = {
      id: generateRandomString(12),
      bot_personality_description: courseData.bot_personality_description,
      avatar_url: courseData.avatar_url,
      stripe_checkout_link_test: courseData.stripe_checkout_link_test,
      stripe_checkout_link_production: courseData.stripe_checkout_link_production,
      is_onboarding: courseData.is_onboarding,
      description: courseData.description,
      short_description: courseData.short_description,
      author: courseData.author,
      price: courseData.price,
      is_free: courseData.is_free,
      course_type: courseData.course_type,
      slug: courseData.slug,
      background_image_url: courseData.background_image_url,
      is_launched: courseData.is_launched,
      featured_order: courseData.featured_order,
      name: courseData.name,
      bot_name: courseData.bot_name,
      course_completed_message: courseData.course_completed_message,
      completion_callback_path: courseData.completion_callback_path,
      bot_id: courseData.bot_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: getCourseTable(),
      Item: course
    })

    const response = await docClient.send(command)
    console.log('creating course', response)

    return course
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

export async function deleteCourse(id: string) {
  try {
    const command = new DeleteCommand({
      TableName: getCourseTable(),
      Key: {
        id: id
      },
      ReturnValues: 'ALL_OLD'
    })

    const response = await docClient.send(command)
    console.log('deleting course', response)

    return response.Attributes || null
  } catch (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

export async function updateCourse(
  id: string,
  courseData: {
    bot_personality_description?: string
    avatar_url?: string
    stripe_checkout_link_test?: string
    stripe_checkout_link_production?: string
    is_onboarding?: boolean
    description?: string
    short_description?: string
    author?: string
    price?: number
    is_free?: boolean
    course_type?: string
    slug?: string
    background_image_url?: string
    is_launched?: boolean
    featured_order?: number
    name?: string
    bot_name?: string
    course_completed_message?: string
    completion_callback_path?: string
    bot_id?: string
  }
) {
  try {
    const updatableCourseData: any = {
      bot_personality_description: courseData.bot_personality_description,
      avatar_url: courseData.avatar_url,
      stripe_checkout_link_test: courseData.stripe_checkout_link_test,
      stripe_checkout_link_production: courseData.stripe_checkout_link_production,
      is_onboarding: courseData.is_onboarding,
      description: courseData.description,
      short_description: courseData.short_description,
      author: courseData.author,
      price: courseData.price,
      is_free: courseData.is_free,
      course_type: courseData.course_type,
      slug: courseData.slug,
      background_image_url: courseData.background_image_url,
      is_launched: courseData.is_launched,
      featured_order: courseData.featured_order,
      name: courseData.name,
      bot_name: courseData.bot_name,
      course_completed_message: courseData.course_completed_message,
      completion_callback_path: courseData.completion_callback_path,
      bot_id: courseData.bot_id
    }

    let updateExpression = 'SET updated_at = :updated_at'
    const expressionAttributeValues: any = {
      ':updated_at': new Date().toISOString()
    }
    const expressionAttributeNames: any = {}

    Object.keys(updatableCourseData).forEach((key, index) => {
      if (updatableCourseData[key as keyof typeof updatableCourseData] !== undefined) {
        updateExpression += `, #${key} = :${key}`
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = courseData[key as keyof typeof courseData]
      }
    })

    const command = new UpdateCommand({
      TableName: getCourseTable(),
      Key: {
        id: id
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)
    console.log('updating course', response)

    return response.Attributes
  } catch (error) {
    console.error('Error updating course:', error)
    throw error
  }
}

export async function getCourse(id: string) {
  try {
    const command = new GetCommand({
      TableName: getCourseTable(),
      Key: {
        id: id
      }
    })

    const response = await docClient.send(command)

    return response.Item || null
  } catch (error) {
    console.error('Error getting course:', error)
    throw error
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const command = new QueryCommand({
      TableName: getCourseTable(),
      IndexName: 'slug-index',
      KeyConditionExpression: '#slug = :slug',
      ExpressionAttributeNames: {
        '#slug': 'slug'
      },
      ExpressionAttributeValues: {
        ':slug': slug
      }
    })

    const response = await docClient.send(command)

    return response.Items?.[0] || null
  } catch (error) {
    console.error('Error getting course by slug:', error)
    throw error
  }
}

export async function getAllCourses() {
  try {
    const command = new ScanCommand({
      TableName: getCourseTable()
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting all courses:', error)
    throw error
  }
}

export async function getCoursesByFeaturedOrder() {
  try {
    const command = new QueryCommand({
      TableName: getCourseTable(),
      IndexName: 'featured_order-index',
      KeyConditionExpression: '#featured_order = :featured_order',
      ExpressionAttributeNames: {
        '#featured_order': 'featured_order'
      },
      ExpressionAttributeValues: {
        ':featured_order': "1"
      },
      ScanIndexForward: true
    })

    const response = await docClient.send(command)

    return response.Items || []
  } catch (error) {
    console.error('Error getting courses by featured order:', error)
    throw error
  }
}