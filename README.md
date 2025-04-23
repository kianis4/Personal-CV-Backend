# Personal CV Backend

## Overview
A comprehensive backend service powering a personal portfolio/CV application with integrated social media feeds and chess statistics visualization. This RESTful API provides secure user authentication, efficient file storage, Instagram media integration, and Chess.com statistics retrieval. Built with scalability and performance in mind.

## Table of Contents
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [External Integrations](#external-integrations)
- [Authentication & Security](#authentication--security)
- [Installation & Configuration](#installation--configuration)
- [File Storage System](#file-storage-system)
- [Implementation Details](#implementation-details)
- [Development Practices](#development-practices)

## Technology Stack

### Core Framework
- **Node.js**: JavaScript runtime (Leveraging async I/O for efficient API calls)
- **Express.js**: Web application framework for creating RESTful endpoints and middleware integration

### Data Management
- **MongoDB** (v5.6.0): NoSQL database with GridFS support
- **GridFS**: File storage system for efficiently managing avatars and media files
- **MongoDB Client** (v5.6.0): Official driver for Node.js MongoDB connectivity

### Authentication & Security
- **JWT** (jsonwebtoken v9.0.0): For stateless authentication and session management
- **bcryptjs** (v2.4.3): Password hashing with salt rounds for secure user credentials
- **CORS** (v2.8.5): Cross-Origin Resource Sharing implementation with configurable origins

### External Integrations
- **Axios** (v1.4.0): Promise-based HTTP client for external API calls with response type streaming
- **Cheerio** (v1.0.0-rc.12): HTML parsing for web scraping Chess.com insights
- **JSDOM** (v22.0.0): For advanced DOM manipulation during scraping processes

### File Processing
- **Multer** (v1.4.5-lts.1): Middleware for handling multipart/form-data file uploads
- **Stream API**: Node.js native streams for efficient file transfers to/from GridFS

### Configuration
- **dotenv** (v16.0.3): Environment variable management for secure credential storage

## System Architecture

The application implements a modular microservice-oriented architecture with the following components:

1. **Authentication Service**: Handles user registration, login, and JWT token generation/verification
2. **Media Service**: Manages file uploads, storage, and retrieval using GridFS
3. **Instagram Integration**: Fetches and processes user's Instagram feed through Graph API
4. **Chess.com Analytics**: Combines API calls and web scraping to collect and aggregate chess statistics

The server follows RESTful principles with clear separation of:
- Route definitions (endpoint handlers)
- Business logic (service implementations)
- Data access layer (MongoDB interactions)
- External API integrations (Instagram, Chess.com)

## Core Features

### User Authentication System
- **Registration Flow**: 
  - Secure user signup with bcrypt password hashing (10 salt rounds)
  - Default avatar assignment
  - Initial profile setup with default values
- **Authentication Mechanism**: 
  - JWT-based login system with token-based verification
  - Login history tracking with date-based analytics
  - Session management through JWT verification middleware

### Profile Management
- **User Profiles**: Store and manage user information
- **Avatar System**: 
  - Default avatar assignment for new users
  - Custom avatar upload with automatic previous avatar cleanup
  - Efficient image serving through GridFS streams

### Instagram Feed Integration
- **Media Fetching**: Automated retrieval from Instagram Graph API
- **Media Processing**: 
  - Support for multiple media types (images, videos, carousel albums)
  - Media metadata extraction and storage
  - Efficient date formatting and organization
- **Carousel Handling**: Special processing for multi-image posts with status tracking

### Chess.com Statistics Aggregation
- **Basic Profile Data**: Direct API access to player profiles
- **Advanced Insights**: 
  - Web scraping for metrics not available in public API
  - Game phase accuracy analysis (opening, middlegame, endgame)
  - Historical performance tracking
- **UUID Extraction**: Advanced parsing to obtain internal Chess.com identifiers

### Comprehensive File Management
- **GridFS Implementation**: MongoDB's solution for files exceeding 16MB
- **File Streaming**: Efficient handling of media with readable/writable streams
- **Content Type Detection**: Automatic MIME type handling for proper file serving
- **File Deduplication**: Player-specific file naming to prevent conflicts

## API Documentation

### Authentication Endpoints

#### `POST /signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User created!"
}
```

**Error Responses:**
- 409: Username already exists
- 500: Server error

#### `POST /login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Logged in!",
  "token": "jwt_token_string",
  "userInfo": {
    "username": "string",
    "name": "string",
    "avatar": "string",
    "puzzlesSolved": 0,
    "registrationDate": "Date",
    "loginDates": ["Date"],
    "loginCount": 0
  }
}
```

**Error Responses:**
- 404: User not found
- 403: Invalid password
- 500: Server error

### Instagram Integration Endpoints

#### `GET /fetchInstagram`
Fetch and store Instagram media.

**Response (200):**
```json
{
  "message": "Instagram data fetched and saved successfully!",
  "posts": {
    "post1": {
      "description": "string",
      "location": "string",
      "date": "YYYY/MM/DD",
      "images": [
        {
          "name": "string",
          "status": "string",
          "imageSrc": "string"
        }
      ]
    }
  }
}
```

#### `GET /images`
List all stored images.

**Response (200):**
```json
{
  "filenames": ["string"]
}
```

#### `GET /image/:filename`
Retrieve a specific image by filename.

**Response:**
- Binary image data with appropriate content type

**Error Responses:**
- 404: Image not found
- 500: Server error

#### `DELETE /deleteAllImages`
Remove all stored images.

**Response (200):**
```json
{
  "message": "All images deleted successfully"
}
```

### Chess.com Integration Endpoints

#### `GET /userData/:username`
Retrieve user profile and chess insights.

**Parameters:**
- username: Chess.com username

**Response (200):**
```json
{
  "userInfo": {
    "name": "string",
    "url": "string",
    "avatar": "string",
    "userName": "string",
    "best_bullet": 0,
    "best_blitz": 0,
    "best_rapid": 0
  },
  "insightData": {
    "overallAccuracy": 0,
    "openingAccuracy": 0,
    "middlegameAccuracy": 0,
    "endgameAccuracy": 0
  }
}
```

**Error Responses:**
- 404: Username not found
- 500: Server error

### Profile Management Endpoints

#### `POST /uploadAvatar`
Upload and update user avatar.

**Request:**
- Multipart form data with 'avatar' field

**Headers:**
- Authorization: Bearer {jwt_token}

**Response (200):**
```json
{
  "message": "Avatar uploaded!",
  "userInfo": {
    "username": "string",
    "name": "string",
    "avatar": "string",
    "puzzlesSolved": 0,
    "registrationDate": "Date",
    "loginDates": ["Date"],
    "loginCount": 0
  }
}
```

**Error Responses:**
- 400: No file uploaded
- 403: Unauthorized
- 500: Server error

#### `GET /protected`
Example of a protected route requiring authentication.

**Headers:**
- Authorization: Bearer {jwt_token}

**Response (200):**
```json
{
  "message": "Access granted",
  "authData": {
    "userId": "string",
    "iat": 0
  }
}
```

**Error Response:**
- 403: Unauthorized

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  hashedPassword: String,
  name: String,
  avatar: String,
  puzzlesSolved: Number,
  registrationDate: Date,
  loginDates: [String],
  loginCount: Number
}
```

### GridFS File Structure
```javascript
// fs.files collection
{
  _id: ObjectId,
  length: Number,
  chunkSize: Number,
  uploadDate: Date,
  filename: String,
  contentType: String
}

// fs.chunks collection
{
  _id: ObjectId,
  files_id: ObjectId,
  n: Number,
  data: Binary
}
```

## External Integrations

### Instagram Graph API
The application integrates with Instagram's Graph API using the following endpoints:
- `https://graph.instagram.com/me/media`: Retrieves user's media feed
- Fields requested: id, caption, media_type, media_url, thumbnail_url, permalink, timestamp, children

Authentication happens via OAuth 2.0 using a long-lived access token stored in environment variables.

### Chess.com API & Web Scraping
Two-tier approach for comprehensive data collection:

1. **Official API Endpoints:**
   - `https://api.chess.com/pub/player/{username}`: Basic profile information
   - `https://api.chess.com/pub/player/{username}/stats`: Game statistics

2. **Advanced Web Scraping:**
   - `https://www.chess.com/insights/{username}`: For extracting UUID
   - `https://www.chess.com/service/insights/{uuid}/rapid/all-time`: For detailed accuracy metrics

Special headers and request parameters are used to simulate browser behavior and extract non-public data.

## Authentication & Security

### Password Management
- Passwords are never stored in plain text
- bcrypt hashing with 10 salt rounds
- Secure comparison for password verification

### JWT Implementation
- Tokens signed with a secure secret key
- Middleware for route protection
- Token verification on protected endpoints

### CORS Configuration
- Configured to allow cross-origin requests from any origin
- Supports various HTTP methods
- Allows necessary headers for authentication

### Data Validation
- Input validation for user registration
- File type validation for uploads
- Error handling for invalid requests

## Installation & Configuration

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- Instagram Developer Account with Graph API access
- Environment variables configured

### Setup Steps
1. Clone the repository
   ```bash
   git clone https://github.com/kianis4/Personal-CV-Backend.git
   cd Personal-CV-Backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN=your_instagram_access_token
   ```

4. Start the server
   ```bash
   node server.js
   ```

5. The server will be available at http://localhost:3000

## File Storage System

### GridFS Implementation
The application uses MongoDB's GridFS for storing files, which:
- Splits files into chunks of 255KB
- Enables efficient streaming of large files
- Supports metadata storage with files
- Provides automatic indexing and retrieval

### Storage Flow
1. Files are received via Multer middleware
2. Converted to readable streams
3. Piped to GridFS upload streams
4. Metadata stored alongside file chunks
5. References saved in user documents

### Retrieval Process
1. Find file by filename in fs.files collection
2. Set appropriate content-type header
3. Create download stream from GridFS
4. Pipe stream directly to HTTP response
5. Handle errors with appropriate status codes

## Implementation Details

### Instagram Post Processing
The system handles various Instagram post types:
- Single images: Stored directly with metadata
- Videos: Stored with proper content type
- Carousel albums: Each item processed individually with parent-child relationship tracking

### Chess Data Aggregation
The implementation combines multiple techniques:
1. Direct API calls for basic profile data
2. HTML parsing with Cheerio for extracting the UUID
3. Additional API calls using the extracted UUID to access non-public endpoints
4. Data normalization and formatting for consistent frontend presentation

### Login Tracking
The system implements a sophisticated login tracking mechanism:
- Stores each unique login date (not duplicating multiple logins on same day)
- Maintains a counter for total unique login days
- Provides this data as part of the user profile

### Avatar Management
User avatars are managed with special care:
1. Default avatar assigned at registration
2. Custom uploads replace previous avatars automatically
3. Old avatar files are removed from GridFS to conserve space
4. Filename prefixed with user ID to prevent conflicts

## Development Practices

### Error Handling
The application implements comprehensive error handling:
- Try/catch blocks around async operations
- Specific error messages for different failure scenarios
- HTTP status codes that accurately reflect error types
- Detailed logging for server-side debugging

### Modular Design
The codebase follows modular design principles:
- Separation of concerns across files
- Feature-specific modules (ChessPage, Instagram integration)
- Utility functions exported for reuse
- Common middleware for authentication

### Scalability Considerations
- Stateless authentication for horizontal scaling
- Efficient database indexing for performance
- Streaming API for handling large files
- Asynchronous processing where appropriate

### Security Best Practices
- Environment variables for sensitive data
- Password hashing for user security
- JWT for secure authentication
- Input validation to prevent injection attacks
- Proper error handling to prevent information leakage