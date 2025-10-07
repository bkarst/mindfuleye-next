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

## 9. StudentSurvey Table
TableName: StudentSurvey
PrimaryKey:
  PartitionKey: studentId (String)
  SortKey: surveyTimestamp (String - ISO 8601 timestamp)
  
Attributes:
  - surveyId: String (UUID - GSI PK)
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
  SurveyIdIndex:
    PartitionKey: surveyId
    ProjectionType: ALL
    
  ParentSurveysIndex:
    PartitionKey: parentId
    SortKey: surveyTimestamp
    
  WeeklyReportsIndex:
    PartitionKey: weekNumber
    SortKey: surveyTimestamp

---

## 10. SurveyResponse Table
TableName: SurveyResponse
PrimaryKey:
  PartitionKey: surveyId (String)
  SortKey: questionId (String)

Attributes:
  - surveyId: String (Foreign Key to StudentSurvey)
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

13. **Get all responses for a survey:**
   - Query: SurveyResponse with surveyId

14. **Get all responses for a student (historical tracking):**
   - Query: SurveyResponse.StudentResponsesIndex with studentId

15. **Get responses by category (e.g., all safety responses):**
   - Query: SurveyResponse.QuestionCategoryIndex with questionCategory

16. **Get flagged/concerning responses:**
   - Query: SurveyResponse.ConcernLevelIndex with concernLevel = "High" or "Critical"

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