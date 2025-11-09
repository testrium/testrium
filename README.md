# Pramana Manager

A modern, AI-powered test case management platform designed to streamline software testing workflows. Pramana Manager is part of the Pramana Suite, offering comprehensive tools for managing test cases, test plans, test runs, and generating insightful reports.

## Key Features

- **Test Case Management**: Create, organize, and maintain test cases with folder hierarchies
- **Test Plans & Runs**: Execute structured test plans and track results in real-time
- **Project-Based Organization**: Manage multiple projects with role-based access control
- **Advanced Reporting**: Generate comprehensive test execution reports and analytics
- **AI-Powered Insights**: Identify duplicate test cases and get intelligent analytics (coming soon)
- **Modern UI/UX**: Clean, intuitive interface built with React and Tailwind CSS
- **Collaborative Testing**: Team-based workflows with member management
- **RESTful API**: Well-documented API for integrations and automation

## Tech Stack

**Frontend**: React 18, Tailwind CSS, shadcn/ui, React Router, Axios
**Backend**: Java Spring Boot, Spring Security, PostgreSQL, JWT Authentication
**Future**: AI/ML integration for test analytics and recommendations

## Why Pramana?

Unlike traditional test management tools like TestRail, Pramana offers a modern, affordable alternative with AI capabilities, designed specifically for agile teams who need powerful testing tools without the complexity.

Built for testers, by testers. 🧪

---

# Pramana Manager - Phase 1: Authentication

## 🎉 What's Included in Phase 1

✅ **Modern UI with shadcn/ui + Tailwind CSS**
✅ **Login Page** - Email/password authentication
✅ **Register Page** - New user registration
✅ **Forgot Password Page** - Password reset flow
✅ **Protected Routes** - Route guards for authenticated pages
✅ **Auth Context** - Centralized authentication state
✅ **API Client** - Axios with interceptors
✅ **Dashboard** - Basic authenticated landing page

---

## 🚀 Quick Start

### 1. Create the Project

```bash
# Run the setup commands from the first artifact
npm create vite@latest pramana-manager -- --template react
cd pramana-manager
```

### 2. Install Dependencies

```bash
# Copy the dependencies from package.json artifact and run:
npm install
```

### 3. Configure Tailwind CSS

Copy the following files:
- `tailwind.config.js`
- `postcss.config.js` (if needed)
- `src/index.css`

### 4. Set Up Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your backend URL
VITE_API_BASE_URL=http://localhost:8080/api
```

### 5. Create the Folder Structure

```
src/
├── api/
│   ├── axios.js
│   └── auth.js
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Card.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── lib/
│   └── utils.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── Dashboard.jsx
├── App.jsx
├── main.jsx
└── index.css
```

### 6. Copy All the Component Files

Copy all the code from the artifacts into the appropriate files in the structure above.

### 7. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` (or the URL shown in terminal)

---

## 🎨 Features & UI Components

### Login Page (`/login`)
- Email/password form with validation
- "Forgot password?" link
- "Sign up" link
- Modern gradient background
- Responsive design

### Register Page (`/register`)
- Username, email, password, confirm password
- Client-side validation
- Auto-login after successful registration
- Link back to login

### Forgot Password (`/forgot-password`)
- Email input for password reset
- Success state with confirmation message
- Back to login button

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- User welcome message
- Logout functionality
- Placeholder stats cards
- Basic header layout

---

## 🔧 Backend API Requirements

Your Spring Boot backend should implement these endpoints:

### Auth Endpoints

```java
POST /api/auth/login
Request: { "email": "user@example.com", "password": "password123" }
Response: { 
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "role": "USER"
  }
}

POST /api/auth/register
Request: { 
  "username": "johndoe",
  "email": "user@example.com", 
  "password": "password123" 
}
Response: { 
  "token": "jwt-token-here",
  "user": { ... }
}

GET /api/auth/me
Headers: { "Authorization": "Bearer jwt-token-here" }
Response: { "id": 1, "username": "johndoe", ... }

POST /api/auth/logout
Headers: { "Authorization": "Bearer jwt-token-here" }
Response: { "message": "Logged out successfully" }

POST /api/auth/forgot-password
Request: { "email": "user@example.com" }
Response: { "message": "Password reset email sent" }
```

---

## 🎯 What's Next (Phase 2)

Phase 2 will include:
- Project management (CRUD)
- Project selector in header
- Project members management
- Better dashboard with real data

---

## 🐛 Troubleshooting

### CORS Issues
Make sure your Spring Boot backend has CORS configured:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 401 Errors
- Check that JWT token is being sent in Authorization header
- Verify token format: `Bearer <token>`
- Check token expiration

### Styling Not Working
- Ensure Tailwind CSS is properly configured
- Check that `index.css` is imported in `main.jsx`
- Verify all CSS variables are defined in `:root`

---

## 📝 Notes

- Tokens are stored in `localStorage` (consider using httpOnly cookies for production)
- Password minimum length is 6 characters (adjust in validation)
- Email validation uses basic regex (can be enhanced)
- Error messages from backend are displayed to users
- Loading states are implemented for all async operations

---

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.js` or `index.css` CSS variables:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* HSL values */
}
```

### Change Logo
Replace the `<TestTube2>` icon in Login/Register pages with your logo component.

### Add Dark Mode Toggle
The CSS variables support dark mode. Add a theme toggle in the dashboard header.

---

## ✅ Testing Checklist

- [ ] Can register a new account
- [ ] Can login with registered credentials
- [ ] Invalid login shows error message
- [ ] Can access dashboard after login
- [ ] Dashboard shows username
- [ ] Can logout successfully
- [ ] Protected routes redirect to login
- [ ] Forgot password form works
- [ ] Form validation works (all fields)
- [ ] Responsive on mobile/tablet

---

## 🚀 Ready for Phase 2?

Once Phase 1 is working and tested, we'll move to Phase 2: **Project Management**!

Let me know if you encounter any issues during setup.