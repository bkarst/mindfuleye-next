# DynamoDB Schema for Mindful Eye Platform

## 1. District Table
TableName: District
PrimaryKey:
  PartitionKey: districtId (String)
  
Attributes:
  - districtId: String (UUID)
  - name: String
  - state: String
  - addressStreet: String
  - addressCity: String
  - addressState: String
  - addressZipCode: String
  - contactPhone: String
  - contactEmail: String
  - contactWebsite: String
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  StateIndex:
    PartitionKey: state
    SortKey: name

---

## 2. School Table
TableName: School
PrimaryKey:
  PartitionKey: schoolId (String)
  
Attributes:
  - schoolId: String (UUID)
  - districtId: String (Foreign Key)
  - name: String
  - level: String (Elementary/Middle/High)
  - addressStreet: String
  - addressCity: String
  - addressState: String
  - addressZipCode: String
  - contactPhone: String
  - contactEmail: String
  - principalName: String
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  DistrictSchoolsIndex:
    PartitionKey: districtId
    SortKey: name
    
  SchoolLevelIndex:
    PartitionKey: level
    SortKey: name

---

## 3. Parent Table
TableName: Parent
PrimaryKey:
  PartitionKey: parentId (String)
  
Attributes:
  - parentId: String (UUID)
  - email: String (unique)
  - firstName: String
  - lastName: String
  - phone: String
  - role: String (Mother/Father/Guardian/Other)
  - notificationEmail: Boolean
  - notificationSms: Boolean
  - notificationPush: Boolean
  - weeklyReminderDay: String
  - reminderTime: String
  - accountStatus: String (Active/Inactive/Suspended)
  - lastLoginAt: String (ISO 8601 timestamp)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  EmailIndex:
    PartitionKey: email
    ProjectionType: ALL

---

## 4. Student Table
TableName: Student
PrimaryKey:
  PartitionKey: studentId (String)
  
Attributes:
  - studentId: String (UUID)
  - schoolId: String (Foreign Key)
  - firstName: String
  - lastName: String
  - dateOfBirth: String (ISO 8601 date)
  - grade: String
  - nickname: String
  - profileColor: String
  - avatar: String (URL or identifier)
  - status: String (Active/Transferred/Graduated)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  SchoolStudentsIndex:
    PartitionKey: schoolId
    SortKey: grade

---

## 5. ParentStudentRelationship Table
TableName: ParentStudentRelationship
PrimaryKey:
  PartitionKey: parentId (String)
  SortKey: studentId (String)
  
Attributes:
  - parentId: String (Foreign Key)
  - studentId: String (Foreign Key)
  - relationship: String (Mother/Father/Guardian/Other)
  - isPrimaryContact: Boolean
  - canViewSurveys: Boolean
  - canEditProfile: Boolean
  - canReceiveAlerts: Boolean
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  StudentParentsIndex:
    PartitionKey: studentId
    SortKey: parentId

---

## 6. Teacher Table
TableName: Teacher
PrimaryKey:
  PartitionKey: teacherId (String)
  
Attributes:
  - teacherId: String (UUID)
  - firstName: String
  - lastName: String
  - email: String
  - phone: String
  - subjects: List<String>
  - status: String (Active/OnLeave/Inactive)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  TeacherEmailIndex:
    PartitionKey: email

---

## 7. TeacherSchoolRelationship Table
TableName: TeacherSchoolRelationship
PrimaryKey:
  PartitionKey: teacherId (String)
  SortKey: schoolId#startDate (String - e.g., "school-123#2023-08-15")
  
Attributes:
  - teacherId: String (Foreign Key)
  - schoolId: String (Foreign Key)
  - startDate: String (ISO 8601 date)
  - endDate: String (ISO 8601 date - optional, null if current)
  - grades: List<String>
  - department: String
  - isCurrent: Boolean
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  SchoolTeachersIndex:
    PartitionKey: schoolId
    SortKey: teacherId
    
  CurrentTeachersIndex:
    PartitionKey: isCurrent
    SortKey: schoolId
    Condition: isCurrent = true

---

## 8. StudentTeacherRelationship Table
TableName: StudentTeacherRelationship
PrimaryKey:
  PartitionKey: studentId (String)
  SortKey: teacherId#academicYear (String - e.g., "teacher-123#2024-2025")
  
Attributes:
  - studentId: String (Foreign Key)
  - teacherId: String (Foreign Key)
  - academicYear: String (e.g., "2024-2025")
  - subject: String (optional - for middle/high school)
  - gradeLevel: String
  - startDate: String (ISO 8601 date)
  - endDate: String (ISO 8601 date - optional, null if current)
  - isCurrent: Boolean
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  TeacherStudentsIndex:
    PartitionKey: teacherId
    SortKey: academicYear
    
  CurrentAssignmentsIndex:
    PartitionKey: isCurrent
    SortKey: studentId
    Condition: isCurrent = true

---

## 9. Survey Table
TableName: Survey
PrimaryKey:
  PartitionKey: surveyId (String)

Attributes:
  - surveyId: String (UUID)
  - name: String (e.g., "Weekly Check-in", "End of Semester Review")
  - grade_level: String (the grade level of the child that the survey in intended for)
  - description: String
  - surveyType: String (Weekly/Monthly/Quarterly/OneTime/Custom)
  - targetAudience: String (Parents/Teachers/Students)
  - isActive: Boolean
  - version: Number (for tracking survey template versions)
  - instructions: String (guidance for survey takers)
  - createdBy: String (userId who created the survey)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  ActiveSurveysIndex:
    PartitionKey: isActive
    SortKey: surveyType
    Condition: isActive = true

  SurveyTypeIndex:
    PartitionKey: surveyType
    SortKey: createdAt

---

## 10. SurveyQuestion Table
TableName: SurveyQuestion
PrimaryKey:
  PartitionKey: surveyId (String)
  SortKey: orderIndex#questionId (String - e.g., "001#question-123")

Attributes:
  - surveyId: String (Foreign Key to Survey)
  - questionId: String (UUID)
  - orderIndex: Number (for display ordering)
  - showInAnalytics (String)
  - questionText: String
  - responseType: String (Text/Number/Boolean/Scale/MultipleChoice/Checkbox)
  - questionCategory: String (Academic/Safety/Social/Behavioral/Communication)
  - isRequired: Boolean
  - isActive: Boolean
  - questionOptions: List<String> (for MultipleChoice/Checkbox types)
  - helperText: String (optional guidance for parents)
  - sectionName: String (optional grouping within survey)
  - conditionalLogic: String (JSON - optional logic for conditional display)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  QuestionIdIndex:
    PartitionKey: questionId
    ProjectionType: ALL

  CategoryOrderIndex:
    PartitionKey: questionCategory
    SortKey: orderIndex

---

## 11. StudentSurvey Table
TableName: StudentSurvey
PrimaryKey:
  PartitionKey: studentId (String)
  SortKey: surveyTimestamp (String - ISO 8601 timestamp)
  
Attributes:
  - surveyInstanceId: String (UUID - unique instance identifier)
  - surveyId: String (Foreign Key to Survey - which survey template was used)
  - studentId: String (Foreign Key)
  - parentId: String (Foreign Key - who completed it)
  - surveyTimestamp: String (ISO 8601 timestamp)
  - weekNumber: Number (Year-Week format for tracking)
  
  # Survey Response Fields (JSON strings for complex data)
  - academicProgressJson: String (JSON)
    # Contains: overallRating, specificConcerns[], notes
      
  - contentConcernsJson: String (JSON)
    # Contains: hasIssues, categories[], description, severity
      
  - safetyCheckJson: String (JSON)
    # Contains: physicalSafety, emotionalWellbeing, socialInteractions, concernDetails
      
  - behaviorChangesJson: String (JSON)
    # Contains: observedChanges[], concernLevel, specificIncidents
      
  - teacherCommunicationJson: String (JSON)
    # Contains: lastContactDate, communicationQuality, openIssues[]
      
  - actionItemsJson: String (JSON)
    # Contains: array of {item, priority, status, dueDate, completedDate}
      
  - completionTimeMinutes: Number
  - flags: List<String> (auto-generated flags for serious concerns)
  - followUpRequired: Boolean
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  SurveyInstanceIdIndex:
    PartitionKey: surveyInstanceId
    ProjectionType: ALL

  SurveyTemplateIndex:
    PartitionKey: surveyId
    SortKey: surveyTimestamp

  ParentSurveysIndex:
    PartitionKey: parentId
    SortKey: surveyTimestamp

  WeeklyReportsIndex:
    PartitionKey: weekNumber
    SortKey: surveyTimestamp

---

## 12. UserSurvey Table
TableName: UserSurvey
PrimaryKey:
  PartitionKey: parentId (String)
  SortKey: surveyInstanceId (String)

Attributes:
  - parentId: String (Foreign Key to Parent)
  - surveyInstanceId: String (Foreign Key to StudentSurvey)
  - surveyId: String (Foreign Key to Survey - the survey template)
  - studentId: String (Foreign Key to Student)
  - status: String (Pending/InProgress/Completed/Skipped)
  - startedAt: String (ISO 8601 timestamp - when parent started the survey)
  - completedAt: String (ISO 8601 timestamp - when parent completed the survey)
  - lastAccessedAt: String (ISO 8601 timestamp - last time parent viewed the survey)
  - reminderSentAt: String (ISO 8601 timestamp - last reminder sent)
  - progress: Number (percentage 0-100 of survey completion)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  SurveyInstanceParentsIndex:
    PartitionKey: surveyInstanceId
    SortKey: parentId

  SurveyTemplateParentsIndex:
    PartitionKey: surveyId
    SortKey: createdAt

  StudentUserSurveysIndex:
    PartitionKey: studentId
    SortKey: createdAt

  StatusIndex:
    PartitionKey: status
    SortKey: createdAt

---

## 13. SurveyResponse Table
TableName: SurveyResponse
PrimaryKey:
  PartitionKey: surveyInstanceId (String)
  SortKey: questionId (String)

Attributes:
  - surveyInstanceId: String (Foreign Key to StudentSurvey)
  - surveyId: String (Foreign Key to Survey - the survey template)
  - questionId: String
  - studentId: String (Foreign Key)
  - parentId: String (Foreign Key)
  - questionText: String
  - questionCategory: String (Academic/Safety/Social/Behavioral/Communication)
  - responseType: String (Text/Number/Boolean/Scale/MultipleChoice)
  - responseValue: String (stores value as string, can be parsed based on responseType)
  - responseNumeric: Number (optional - for numeric/scale responses)
  - responseBoolean: Boolean (optional - for boolean responses)
  - concernLevel: String (None/Low/Medium/High/Critical)
  - requiresFollowUp: Boolean
  - notes: String (optional additional notes)
  - answeredAt: String (ISO 8601 timestamp)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)

GSI:
  StudentResponsesIndex:
    PartitionKey: studentId
    SortKey: answeredAt

  QuestionCategoryIndex:
    PartitionKey: questionCategory
    SortKey: answeredAt

  ConcernLevelIndex:
    PartitionKey: concernLevel
    SortKey: answeredAt

---

## 14. SurveyNotification Table
TableName: SurveyNotification
PrimaryKey:
  PartitionKey: parentId (String)
  SortKey: scheduledDate#notificationId (String - e.g., "2025-01-15#notif-123")

Attributes:
  - notificationId: String (UUID)
  - parentId: String (Foreign Key to Parent)
  - studentId: String (Foreign Key to Student)
  - surveyId: String (Foreign Key to Survey template)
  - surveyInstanceId: String (Foreign Key to StudentSurvey - optional, null if not yet created)
  - scheduledDate: String (ISO 8601 date - e.g., "2025-01-15")
  - scheduledTime: String (Time in 24hr format - e.g., "09:00")
  - weekNumber: Number (Year-Week format for tracking - e.g., 202503 for week 3 of 2025)
  - notificationType: String (Email/SMS/Push)
  - status: String (Scheduled/Sent/Delivered/Failed/Cancelled)
  - subject: String (notification subject/title)
  - message: String (notification message body)
  - templateId: String (optional - reference to notification template)
  - sentAt: String (ISO 8601 timestamp - when notification was sent)
  - deliveredAt: String (ISO 8601 timestamp - when notification was confirmed delivered)
  - failedAt: String (ISO 8601 timestamp - when notification failed)
  - attemptCount: Number (number of delivery attempts)
  - lastError: String (error message from last failed attempt)
  - nextRetryAt: String (ISO 8601 timestamp - when to retry if failed)
  - metadata: String (JSON - additional notification metadata)
  - createdAt: String (ISO 8601 timestamp)
  - update
  - dAt: String (ISO 8601 timestamp)

GSI:
  ScheduledDateIndex:
    PartitionKey: scheduledDate
    SortKey: scheduledTime
    ProjectionType: ALL
    # For batch processing notifications scheduled for a specific date

  StatusIndex:
    PartitionKey: status
    SortKey: scheduledDate#scheduledTime
    ProjectionType: ALL
    # For finding pending/failed notifications that need to be sent

  StudentNotificationsIndex:
    PartitionKey: studentId
    SortKey: scheduledDate
    ProjectionType: ALL
    # For tracking all notifications for a specific student

  SurveyInstanceIndex:
    PartitionKey: surveyInstanceId
    SortKey: createdAt
    ProjectionType: ALL
    # For finding all notifications related to a survey instance

---

## Access Patterns & Query Examples

### Common Query Patterns:

1. **Get all children for a parent:**
   - Query: ParentStudentRelationship with parentId
   - Then: BatchGet Student by studentIds

2. **Get all parents for a student:**
   - Query: ParentStudentRelationship.StudentParentsIndex with studentId

3. **Get all surveys for a student:**
   - Query: StudentSurvey with studentId, optional date range on sortKey

4. **Get recent surveys by parent:**
   - Query: StudentSurvey.ParentSurveysIndex with parentId

5. **Get students in a school:**
   - Query: Student.SchoolStudentsIndex with schoolId

6. **Get all teachers at a school (current and historical):**
   - Query: TeacherSchoolRelationship.SchoolTeachersIndex with schoolId

7. **Get current teachers at a school:**
   - Query: TeacherSchoolRelationship.SchoolTeachersIndex with schoolId
   - FilterExpression: isCurrent = true

8. **Get teacher employment history:**
   - Query: TeacherSchoolRelationship with teacherId

9. **Get all teachers for a student (historical):**
   - Query: StudentTeacherRelationship with studentId

10. **Get current teacher(s) for a student:**
   - Query: StudentTeacherRelationship with studentId
   - FilterExpression: isCurrent = true

11. **Get all students for a teacher in a specific year:**
   - Query: StudentTeacherRelationship.TeacherStudentsIndex with teacherId and academicYear

12. **Weekly completion tracking:**
   - Query: StudentSurvey.WeeklyReportsIndex with weekNumber

13. **Get all surveys assigned to a parent:**
   - Query: UserSurvey with parentId

14. **Get all parents assigned to a survey instance:**
   - Query: UserSurvey.SurveyInstanceParentsIndex with surveyInstanceId

15. **Get all surveys for a student (via UserSurvey):**
   - Query: UserSurvey.StudentUserSurveysIndex with studentId

16. **Get all pending/incomplete surveys:**
   - Query: UserSurvey.StatusIndex with status = "Pending" or "InProgress"

17. **Get all active survey templates:**
   - Query: Survey.ActiveSurveysIndex with isActive = true

18. **Get surveys by type (e.g., all weekly surveys):**
   - Query: Survey.SurveyTypeIndex with surveyType

19. **Get all questions in a survey (ordered):**
   - Query: SurveyQuestion with surveyId
   - Results automatically sorted by orderIndex in sort key

20. **Get a specific question by questionId:**
   - Query: SurveyQuestion.QuestionIdIndex with questionId

21. **Get questions by category in order:**
   - Query: SurveyQuestion.CategoryOrderIndex with questionCategory

22. **Get all responses for a survey instance:**
   - Query: SurveyResponse with surveyInstanceId

23. **Get all survey instances using a template:**
   - Query: StudentSurvey.SurveyTemplateIndex with surveyId

24. **Get all responses for a student (historical tracking):**
   - Query: SurveyResponse.StudentResponsesIndex with studentId

25. **Get responses by category (e.g., all safety responses):**
   - Query: SurveyResponse.QuestionCategoryIndex with questionCategory

26. **Get flagged/concerning responses:**
   - Query: SurveyResponse.ConcernLevelIndex with concernLevel = "High" or "Critical"

27. **Get all notifications for a parent:**
   - Query: SurveyNotification with parentId

28. **Get notifications scheduled for a specific date:**
   - Query: SurveyNotification.ScheduledDateIndex with scheduledDate

29. **Get all pending notifications that need to be sent:**
   - Query: SurveyNotification.StatusIndex with status = "Scheduled" or "Failed"
   - FilterExpression: scheduledDate <= today

30. **Get all failed notifications for retry:**
   - Query: SurveyNotification.StatusIndex with status = "Failed"
   - FilterExpression: nextRetryAt <= currentTime

31. **Get all notifications for a student:**
   - Query: SurveyNotification.StudentNotificationsIndex with studentId

32. **Get all notifications for a survey instance:**
   - Query: SurveyNotification.SurveyInstanceIndex with surveyInstanceId

33. **Process notifications for batch sending (daily job):**
   - Query: SurveyNotification.ScheduledDateIndex with scheduledDate = today
   - FilterExpression: status = "Scheduled"
   - Sort by scheduledTime for ordered processing

---

## Capacity Planning Recommendations

### On-Demand vs Provisioned:
- Start with On-Demand pricing for unpredictable workloads
- Monitor usage and switch to Provisioned if consistent patterns emerge

### TTL Configuration:
- Archive old surveys to S3 after 2-3 years via DynamoDB Streams

### Backup Strategy:
- Enable Point-In-Time Recovery (PITR) for all tables
- Weekly automated backups retained for 35 days
- Consider cross-region replication for disaster recovery