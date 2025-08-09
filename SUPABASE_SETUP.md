# Supabase Database Setup Instructions

To connect your ChatBot Pro application to Supabase, please follow these steps:

## 1. Create a Supabase Project
1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Create a new project if you haven't already
3. Choose a project name and database password

## 2. Get Your Connection String
1. Once in the project page, click the "Connect" button on the top toolbar
2. Copy URI value under "Connection string" -> "Transaction pooler"
3. Replace `[YOUR-PASSWORD]` with the database password you set for the project

## 3. Set the Environment Variable
1. In your Replit project, go to the Secrets tab (lock icon in the sidebar)
2. Add a new secret with:
   - Key: `DATABASE_URL`
   - Value: Your Supabase connection string from step 2

The connection string should look like this:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## 4. What's Been Set Up
- ✅ Database configuration updated to work with Supabase
- ✅ Simple signup/signin buttons created
- ✅ Clean authentication interface at /auth
- ✅ Password-based user registration and login
- ✅ Multi-tenant architecture with role-based access

## 5. Test the System
Once you've added the DATABASE_URL secret:
1. Visit `/auth` to see the new simple authentication interface
2. Create a new account using the signup form
3. Test login with your new credentials
4. The system will automatically handle user sessions and role management

Your ChatBot Pro platform is ready to use with Supabase!