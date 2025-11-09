# Phase 1 Testing Guide

## Prerequisites
- Spring Boot backend running on `http://localhost:8080`
- Backend must have these endpoints ready:
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - POST `/api/auth/logout`
  - POST `/api/auth/forgot-password`
  - GET `/api/auth/me`

## Start Application
```bash
npm run dev
```
Visit: `http://localhost:5173`

## Test Cases

### 1. Registration Flow
- Navigate to `/register`
- Fill form: username, email, password (min 6 chars), confirm password
- Submit → Should redirect to dashboard

### 2. Login Flow
- Navigate to `/login`
- Enter registered email + password
- Submit → Should redirect to dashboard
- Verify username displays in header

### 3. Protected Routes
- Logout
- Try accessing `/dashboard` directly → Should redirect to `/login`

### 4. Forgot Password
- Navigate to `/forgot-password`
- Enter email
- Submit → Should show success message

### 5. Logout
- From dashboard, click Logout button
- Should redirect to `/login`
- Try accessing `/dashboard` → Should redirect to `/login`

## Without Backend (Mock Testing)
If backend not ready, expect API errors. You can:
1. Check UI/UX works correctly
2. Verify form validations work
3. Check routing works
4. Verify localStorage token management (browser DevTools)

## Quick Verification
- Build succeeds: ✅
- Dev server starts: Run `npm run dev`
- Pages render: Check all routes
- Forms validate: Try empty/invalid inputs
