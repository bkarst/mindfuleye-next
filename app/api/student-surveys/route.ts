import { NextRequest, NextResponse } from 'next/server'
import { createStudentSurvey, getAllStudentSurveys } from '@/model/student-survey'

export async function GET() {
  try {
    const surveys = await getAllStudentSurveys()
    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Error fetching student surveys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student surveys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const survey = await createStudentSurvey(body)
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating student survey:', error)
    return NextResponse.json(
      { error: 'Failed to create student survey' },
      { status: 500 }
    )
  }
}
