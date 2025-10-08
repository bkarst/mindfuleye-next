import { NextRequest, NextResponse } from 'next/server'
import { getSurvey, updateSurvey, deleteSurvey } from '@/model/survey'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params
    const survey = await getSurvey(surveyId)

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params
    const body = await request.json()
    const updatedSurvey = await updateSurvey(surveyId, body)

    if (!updatedSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedSurvey)
  } catch (error) {
    console.error('Error updating survey:', error)
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params
    const deletedSurvey = await deleteSurvey(surveyId)

    if (!deletedSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedSurvey)
  } catch (error) {
    console.error('Error deleting survey:', error)
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    )
  }
}
