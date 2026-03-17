# Furniture Designer - MERN Stack

A web application for designing furniture layouts in rooms using 2D and 3D visualization.

## Features

- User authentication (register/login)
- Room setup with customizable dimensions, colors, and shapes
- Furniture placement (chairs, tables, etc.)
- 2D and 3D visualization
- Design saving and management
- Responsive UI with brown/white theme

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens

## Project Structure

```
furniture-designer-mern/
├── src/
│   ├── backend/          # Express.js server
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Authentication middleware
│   │   └── server.js     # Main server file
│   └── frontend/         # React application
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── pages/       # Page components
│       │   └── App.js       # Main app component
│       └── package.json
├── package.json          # Root package.json for running both
└── README.md
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd furniture-designer-mern
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `furniture-designer`
   - Update the connection string in `src/backend/server.js` if needed

4. **Environment Variables**

   **Backend Environment Variables**  
   Create a `.env` file in `src/backend/`:
   ```
   PORT=5007
   MONGODB_URI=mongodb+srv://lakshannaveen578_db_user:xDQptYLGCilshBjc@cluster0.sli39ob.mongodb.net/furniture-designer?retryWrites=true&w=majority
   JWT_SECRET=2030
   ```

   **Frontend Environment Variables**  
   Create a `.env` file in `src/frontend/`:
   ```
   REACT_APP_API_URL=http://localhost:5007
   ```

## Running the Application

### Option 1: Run Both Frontend and Backend Together
From the root directory:
```bash
npm start
```
This will start:
- Backend server at http://localhost:5000
- Frontend React app at http://localhost:3000

### Option 2: Run Frontend and Backend Separately

**To run the Backend:**
```bash
# From root directory
npm run server
# OR
cd src/backend
npm start
```

**To run the Frontend:**
```bash
# From root directory
npm run client
# OR
cd src/frontend
npm start
```

Make sure MongoDB is running before starting the backend.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Designs
- `GET /api/designs` - Get user's designs
- `POST /api/designs` - Create new design
- `PUT /api/designs/:id` - Update design
- `DELETE /api/designs/:id` - Delete design

## Usage

1. Register a new account or login with existing credentials
2. Access the dashboard to view saved designs
3. Create a new design to start furniture layout
4. Set up room dimensions, colors, and shapes
5. Add furniture items and position them
6. Switch between 2D and 3D views
7. Save the design for later access

## Development

- Backend: `npm run server` (from root) or `cd src/backend && npm start`
- Frontend: `npm run client` (from root) or `cd src/frontend && npm start`