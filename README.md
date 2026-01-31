# Event Management System

A full-stack event management application built with Next.js frontend and Node.js backend.

## Project Structure

```
├── backend/                 # Node.js backend
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
└── event-management-frontend/  # Next.js frontend
    ├── app/               # Next.js app directory
    ├── components/        # React components
    ├── hooks/             # Custom React hooks
    ├── lib/               # Utility libraries
    └── public/            # Static assets
```

## Features

- **Event Management**: Create, read, update, and delete events
- **User Management**: User profiles and authentication
- **Timezone Support**: Handle events across different timezones
- **Event Logging**: Track changes and updates to events
- **Modern UI**: Built with Next.js and Tailwind CSS
- **RESTful API**: Node.js backend with Express

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or pnpm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-jwt-secret-key
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd event-management-frontend
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Deployment on Render

This project is configured for easy deployment on Render using the included `render.yaml` file.

### Option 1: One-Click Deploy (Recommended)

1. Fork this repository to your GitHub account
2. Connect your GitHub account to Render
3. Create a new "Blueprint" on Render and select this repository
4. Render will automatically detect the `render.yaml` file and deploy both services

### Option 2: Manual Deployment

#### Deploy Backend

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `event-management-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string

5. Deploy the service

#### Deploy Frontend

1. Create another Web Service on Render
2. Connect the same GitHub repository
3. Configure the service:
   - **Name**: `event-management-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd event-management-frontend && npm install && npm run build`
   - **Start Command**: `cd event-management-frontend && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`

5. Deploy the service

### Database Setup

1. Create a PostgreSQL database on Render (Free tier available)
2. Update your backend to use the provided connection string
3. Or use MongoDB Atlas for a cloud MongoDB solution

### Important Notes

- Free tier services on Render may spin down after inactivity
- The first request after inactivity may take 30+ seconds to respond
- For production use, consider upgrading to paid plans for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.