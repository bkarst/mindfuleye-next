import { NextRequest, NextResponse } from 'next/server'
import { createSurveyQuestion, getQuestionsBySurvey } from '@/model/survey-question'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params
    const questions = await getQuestionsBySurvey(surveyId)
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching survey questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey questions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params
    const body = await request.json()
    const question = await createSurveyQuestion({
      ...body,
      surveyId
    })
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating survey question:', error)
    return NextResponse.json(
      { error: 'Failed to create survey question' },
      { status: 500 }
    )
  }
}
