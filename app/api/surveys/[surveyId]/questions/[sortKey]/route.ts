import { NextRequest, NextResponse } from 'next/server'
import { getSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion } from '@/model/survey-question'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string; sortKey: string }> }
) {
  try {
    const { surveyId, sortKey } = await params
    const decodedSortKey = decodeURIComponent(sortKey)
    const question = await getSurveyQuestion(surveyId, decodedSortKey)

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching survey question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string; sortKey: string }> }
) {
  try {
    const { surveyId, sortKey } = await params
    const decodedSortKey = decodeURIComponent(sortKey)
    const body = await request.json()
    const updatedQuestion = await updateSurveyQuestion(surveyId, decodedSortKey, body)

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Error updating survey question:', error)
    return NextResponse.json(
      { error: 'Failed to update survey question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string; sortKey: string }> }
) {
  try {
    const { surveyId, sortKey } = await params
    const decodedSortKey = decodeURIComponent(sortKey)
    const deletedQuestion = await deleteSurveyQuestion(surveyId, decodedSortKey)

    if (!deletedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedQuestion)
  } catch (error) {
    console.error('Error deleting survey question:', error)
    return NextResponse.json(
      { error: 'Failed to delete survey question' },
      { status: 500 }
    )
  }
}
