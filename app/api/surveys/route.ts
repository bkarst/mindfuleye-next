import { NextRequest, NextResponse } from 'next/server'
import { createSurvey, getAllSurveys } from '@/model/survey'

export async function GET() {
  try {
    const surveys = await getAllSurveys()
    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const survey = await createSurvey(body)
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}
