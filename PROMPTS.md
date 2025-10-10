Does the question have an is_required attribute?



Add an additional table to the schema (content/dynamo-db-schema.md). This table needs to be called UserSurvey and it associates a student-survey with the parent taking that survey. 

In the model/migrate folder, add createUserSurvey, model it on the other files in the folder. 

add survey question
add user survey
add parent organization?

promote in utah

Using content/dynamo-db-schema.md, create the file model/user-survey.ts and add the create, read, update, and delete method that model/district.ts has. 

In test/user-survey.ts, write a suite of tests that test create, read, update, delete for model/user-survey.ts. It should be runnable via command line. Model the tests in test/school.ts. 

Modify createTable to account for creating dynamo db tables with an APP_PREFIX as the prefix to the table and the environemnt appended to the table. For example MindfulEyeTeacherDevelopment, where MindfulEye is the Prefix, Teacher is the entity, and Development is the environement. 

In the model/migrate folder, create a file called createStudent. Use content/dynamo-db-schema.md. It should use the createTable function that already exists. 
