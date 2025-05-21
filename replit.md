# TDX - Investment Rewards Platform

## Overview

TDX is a web application that allows users to participate in investment reward programs, manage deposits and withdrawals, refer friends, and verify their YouTube account. The platform provides both user and admin interfaces with different capabilities.

The application uses a React frontend with Typescript, Express backend, and Drizzle ORM for database operations. It follows a modern architecture with a clear separation between client and server code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a traditional client-server architecture with a RESTful API backend and a React-based SPA frontend.

### Frontend Architecture

- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: React Query for server state, React Context for global application state
- **UI Components**: Custom components built on top of Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with a custom theme

The frontend is organized into pages and components with shared hooks for common functionality like authentication and toast notifications.

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **API**: RESTful API endpoints for user operations, authentication, and admin tasks
- **Authentication**: JWT-based authentication stored in sessions
- **File Storage**: Local file storage for receipt uploads and YouTube verification screenshots

### Data Layer

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (provisioned through the Replit environment)
- **Schema**: Defined in shared schema files that are used by both frontend and backend

## Key Components

### Authentication System

Uses JWT tokens with server-side sessions to maintain user authentication. Passwords are hashed using bcrypt. The auth system supports different user roles (user and admin) with appropriate access controls.

### Investment Reward Programs

Allows users to select investment tiers that provide different weekly profit amounts. The system tracks deposits, profits, and withdrawals.

### Verification System

Two types of verification:
1. Deposit verification via receipt upload
2. YouTube verification by uploading screenshots

### Referral System

Users can generate referral links and earn bonuses when other users sign up using their referral code.

### Admin Dashboard

Provides interfaces for administrators to:
- Review and approve deposits
- Process withdrawals
- Manage user accounts
- Post announcements

## Data Flow

1. **User Authentication**:
   - User registers or logs in
   - Server validates credentials and creates a JWT token
   - Token is stored in session and used for subsequent requests

2. **Investment Flow**:
   - User selects a reward program tier
   - User uploads a deposit receipt
   - Admin verifies the deposit
   - System begins tracking weekly profits

3. **Withdrawal Flow**:
   - User requests a withdrawal
   - System applies a withdrawal fee
   - Admin processes the withdrawal request
   - Email notification is sent to admin

4. **Referral Flow**:
   - User shares referral link
   - New user registers with referral code
   - Referrer receives a bonus

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI components (@radix-ui/react-*)
- **Styling**: Tailwind CSS, class-variance-authority
- **Form Handling**: React Hook Form with Zod for validation
- **Data Fetching**: TanStack Query (@tanstack/react-query)
- **Routing**: Wouter

### Backend Dependencies
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Authentication**: bcrypt, jsonwebtoken
- **File Upload**: multer
- **Email**: nodemailer (configured for development)

## Deployment Strategy

The application is configured to be deployed in the Replit environment:

1. **Development**: 
   - Uses `npm run dev` to start both frontend and backend in development mode
   - Vite serves the frontend with hot module replacement

2. **Production**:
   - Frontend is built using Vite
   - Backend is bundled with esbuild
   - Both are served from a single Express server

The deployment configuration is defined in the `.replit` file with appropriate build and run commands for the Replit environment.

## Database Schema

Key entities in the database include:

1. **Users**: Stores user information, authentication details, and referral data
2. **Deposits**: Tracks user deposits with approval status and receipt information
3. **Withdrawals**: Records withdrawal requests with processing status and fees
4. **YouTube Verifications**: Tracks users' YouTube verification process
5. **Reward Programs**: Stores users' active investment programs
6. **Transactions**: Records all financial transactions
7. **Announcements**: Stores system-wide announcements

## Getting Started

To start development:
```
npm run dev
```

To build for production:
```
npm run build
```

To start the production server:
```
npm run start
```

To push database schema changes:
```
npm run db:push
```

## File Structure

- `/client` - Frontend React application
  - `/src` - Source code
    - `/components` - Reusable UI components
    - `/hooks` - Custom React hooks
    - `/lib` - Utility functions and constants
    - `/pages` - Page components for routing
- `/server` - Backend Express application
  - API routes, authentication, file storage
- `/shared` - Shared code used by both client and server
  - Database schema definitions
- `/uploads` - Storage for uploaded files
  - `/receipts` - Deposit receipt images
  - `/youtube` - YouTube verification screenshots