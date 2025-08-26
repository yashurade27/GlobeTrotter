# Globetrotter - Travel Trip Planner

Globetrotter is a comprehensive travel planning application built with Next.js, Prisma ORM, and PostgreSQL. Plan your trips, manage destinations, create detailed itineraries, and track activities all in one place.

## Features

- **User Authentication**: Secure signup, login, and profile management
- **Trip Management**: Create and manage trips with dates, budget, and images
- **Destination Planning**: Add multiple destinations to your trips
- **Itinerary Builder**: Create detailed day-by-day itineraries
- **Activity Tracking**: Plan activities with times, locations, and costs
- **Responsive Design**: Beautiful UI that works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Backend**: Next.js Server Actions and API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (We recommend using Neon DB for easy setup)

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your database connection string and other required values.

3. Generate Prisma client and run migrations
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Database Setup

This project uses Prisma ORM with PostgreSQL. Follow these steps to set up your database:

1. Create a PostgreSQL database (can be local or using Neon DB)
2. Update your DATABASE_URL in the .env file
3. Run the initial migration:
```bash
npx prisma migrate dev --name init
```

## Project Structure

```
globetrotter/
├── app/                 # Next.js App Router pages
│   ├── api/             # API routes
│   ├── login/           # Authentication pages
│   ├── register/        # User registration
│   ├── create-trip/     # Trip creation pages
│   └── trips/           # Trip management pages
├── components/          # React components
│   ├── ui/              # UI components (shadcn/ui)
│   └── ...              # Feature-specific components
├── lib/                 # Utility functions and business logic
│   ├── actions/         # Server actions
│   └── db.ts            # Prisma client initialization
├── prisma/              # Prisma schema and migrations
│   └── schema.prisma    # Database schema
├── public/              # Static assets
└── middleware.ts        # Next.js middleware for auth protection
```

## Authentication Flow

The app uses JWT-based authentication with secure HTTP-only cookies:

1. User signs up or logs in
2. Server creates a JWT token and sets it in an HTTP-only cookie
3. Middleware checks for the token on protected routes
4. Server actions validate the token before performing operations

## Deployment

For production deployment, we recommend using Vercel for the application and Neon DB for the PostgreSQL database:

1. Create a Neon PostgreSQL database
2. Push your code to GitHub
3. Connect your repository to Vercel
4. Set up the environment variables in Vercel
5. Deploy!
