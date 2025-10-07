# District Model Tests

## Prerequisites

Before running the tests, ensure you have:

### 1. Environment Variables

Create or update your `.env` file in the project root with the following:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_RUNTIME_ENV=test
```

### 2. DynamoDB Tables

Ensure the following DynamoDB table exists in your AWS account:

**Table Name:** `MindfulEyeDistrictTest` (for test environment)

**Primary Key:**
- Partition Key: `districtId` (String)

**Global Secondary Index (GSI):**
- Index Name: `StateIndex`
- Partition Key: `state` (String)
- Sort Key: `name` (String)

You can create this table using:
- AWS Console
- AWS CLI
- Infrastructure as Code (Terraform, CloudFormation, CDK)

### 3. AWS Credentials

Make sure your AWS credentials have permissions to:
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Scan`
- `dynamodb:Query`

## Running the Tests

```bash
npm run test:district
```

## Test Coverage

The test suite includes:

1. **Create District** - Tests creating a new district with all fields
2. **Get District** - Tests retrieving a district by ID
3. **Update District** - Tests updating district fields
4. **Get All Districts** - Tests scanning all districts
5. **Get Districts By State** - Tests querying by state using GSI
6. **Delete District** - Tests deleting a district
7. **Create District with Minimal Data** - Tests creating with only required fields
8. **Update Partial Fields** - Tests updating a subset of fields

## Troubleshooting

### Invalid Security Token Error

If you see: `UnrecognizedClientException: The security token included in the request is invalid`

**Possible causes:**
1. AWS credentials are missing or incorrect in `.env`
2. AWS credentials have expired (if using temporary credentials)
3. Credentials don't have proper IAM permissions

### Table Not Found Error

If you see: `ResourceNotFoundException: Cannot do operations on a non-existent table`

**Solution:** Create the DynamoDB table as specified in Prerequisites section 2

### Wrong Runtime Environment

Make sure `NEXT_PUBLIC_RUNTIME_ENV` is set to `test` to use the test table:
- `development` → `MindfulEyeDistrictDevelopment`
- `test` → `MindfulEyeDistrictTest`
- `production` → `MindfulEyeDistrict`
