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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.