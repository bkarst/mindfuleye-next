import { NextRequest, NextResponse } from 'next/server'
import { deleteStudentSurvey } from '@/model/student-survey'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; surveyTimestamp: string }> }
) {
  try {
    const { studentId, surveyTimestamp } = await params
    const deletedSurvey = await deleteStudentSurvey(studentId, surveyTimestamp)

    if (!deletedSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedSurvey)
  } catch (error) {
    console.error('Error deleting student survey:', error)
    return NextResponse.json(
      { error: 'Failed to delete student survey' },
      { status: 500 }
    )
  }
}
