# Project Report: CivicWatch (Smart Local Issue Reporting System)

This document provides the necessary information for your project exam, structured exactly as requested.

## 1. Title
**CivicWatch: Smart Local Issue Reporting and Management System**

## 2. Synopsis
The Smart Local Issue Reporting System (CivicWatch) is a full-stack web application designed to bridge the gap between citizens and local civic authorities. It empowers citizens to report local infrastructure and civic issues (like potholes, broken streetlights, or waste accumulation) by uploading images, descriptions, and geo-locations. The system utilizes a machine learning classifier to automatically categorize and prioritize reported issues. Local authorities can view, manage, and update the status of these issues through a dedicated dashboard. Real-time notifications ensure users are kept informed about the progress of their reports, promoting transparency and efficient civic management.

## 3. Hardware and Software Configuration
**Hardware Requirements:**
*   **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (i5/Ryzen 5 recommended for ML model training)
*   **RAM:** Minimum 8 GB (16 GB recommended)
*   **Storage:** 256 GB SSD (50 GB free space required)
*   **Internet:** Broadband connection for cloud services and map APIs.

**Software Requirements:**
*   **Operating System:** Windows 10/11, macOS, or Linux
*   **Frontend Technology:** React.js, HTML5, Vanilla CSS
*   **Backend Technology:** Node.js, Express.js
*   **Machine Learning Service:** Python 3.x, Scikit-learn/TensorFlow
*   **Database:** MongoDB (MongoDB Atlas for cloud hosting)
*   **Additional Services:** Cloudinary (Media Storage), Socket.io (Real-time WebSockets), JSON Web Tokens (JWT) for authentication.
*   **Development Tools:** VS Code, Git, Postman.

## 4. Module Description
The system is divided into several interconnected modules:
1.  **User Authentication Module:** Handles user and administrator registration, login, and session management using secure JWT tokens.
2.  **Issue Reporting Module (Citizen):** Allows users to submit new issues. It captures the title, description, category, priority, GPS location, and uploaded images.
3.  **Machine Learning Categorization Module:** A background Python service that analyzes the text/image of the reported issue to suggest the correct category and determine the initial priority level.
4.  **Admin Dashboard Module:** A secure interface for civic officials to view all reported issues, filter them by status or category, and update their resolution status (e.g., Pending, In Progress, Resolved).
5.  **Notification System Module:** Uses Socket.io to push real-time updates to citizens when the status of their reported issue changes.
6.  **Media Management Module:** Integrates with Cloudinary to handle the uploading, optimization, and retrieval of images attached to issue reports.

## 5. ER and DFD Diagrams

### Entity Relationship (ER) Diagram Description
*   **Entities:** `User`, `Issue`, `Notification`, `Category`
*   **Relationships:**
    *   One `User` (Citizen) can report Many `Issues` (1:N).
    *   One `User` (Admin) can manage Many `Issues` (1:N).
    *   One `Issue` belongs to One `Category` (1:1).
    *   One `Issue` triggers Many `Notifications` (1:N).
    *   One `Notification` is received by One `User` (1:1).

### Data Flow Diagram (DFD) Description
*   **Level 0 (Context Diagram):** Shows the Citizen and Admin as external entities interacting with the "CivicWatch System". Citizens input issues and receive status updates. Admins input status updates and view reports.
*   **Level 1 DFD:** Breaks down the system into major processes: 
    1. Authenticate User. 
    2. Submit Issue (sends data to DB and ML service). 
    3. Manage Issues (Admin process to update DB). 
    4. Generate Notifications (reads from DB and sends to User).

## 6. Form Design
*   **Login/Registration Form:** Clean interface with fields for Full Name, Email, Password, and Role selection. Includes validation for email format and password strength.
*   **Report Issue Form:** 
    *   *Input fields:* Title (text), Description (textarea).
    *   *Dropdowns:* Category (pre-populated), Urgency Level.
    *   *Map Integration:* A map component to pinpoint the exact location (Latitude/Longitude).
    *   *File Upload:* A drag-and-drop zone for uploading images.
    *   *Submit Button:* Triggers the API call with visual loading indicators.
*   **Admin Update Form:** A modal window on the dashboard with a dropdown to change the status (Pending -> In-progress -> Resolved) and an optional text area for official remarks.

## 7. Database Connectivity
The application uses Mongoose (an Object Data Modeling library) to connect the Node.js backend to the MongoDB database. 
*   **Connection String:** Stored securely in a `.env` file (`MONGODB_URI`).
*   **Process:** The backend establishes a pool of connections on startup using `mongoose.connect()`. All API routes perform CRUD (Create, Read, Update, Delete) operations asynchronously using Mongoose schema models. Connection errors are caught and logged to prevent server crashes.

## 8. Table Design or Schema (MongoDB Collections)
Since we use MongoDB (NoSQL), we define Schemas instead of strict relational tables.

**User Schema:**
*   `_id`: ObjectId (Primary Key)
*   `name`: String (Required)
*   `email`: String (Required, Unique)
*   `password`: String (Hashed)
*   `role`: String (Enum: 'citizen', 'admin')
*   `createdAt`: Date

**Issue Schema:**
*   `_id`: ObjectId (Primary Key)
*   `title`: String (Required)
*   `description`: String
*   `category`: String (e.g., 'Road', 'Water', 'Electricity')
*   `status`: String (Enum: 'Pending', 'In Progress', 'Resolved')
*   `priority`: String (Enum: 'Low', 'Medium', 'High', 'Critical')
*   `location`: Object { lat: Number, lng: Number, address: String }
*   `images`: Array of Strings (Cloudinary URLs)
*   `reportedBy`: ObjectId (Foreign Key -> User._id)
*   `createdAt`: Date, `updatedAt`: Date

**Notification Schema:**
*   `_id`: ObjectId
*   `userId`: ObjectId (Foreign Key -> User._id)
*   `issueId`: ObjectId (Foreign Key -> Issue._id)
*   `message`: String
*   `read`: Boolean (Default: false)

## 9. Conclusion
The CivicWatch platform successfully provides a modern, scalable, and user-friendly solution for managing local infrastructure problems. By integrating mobile-responsive web technologies with a robust backend and real-time features, it simplifies the reporting process for citizens. Furthermore, the inclusion of an automated machine learning categorization module reduces the administrative burden on civic officials, leading to faster response times and improved urban maintenance.

## 10. Future Enhancements
*   **Mobile Application:** Developing native Android and iOS applications using React Native for broader accessibility.
*   **Social Media Integration:** Allowing users to sign in via Google/Facebook and share resolved issues to social platforms.
*   **Advanced AI Analysis:** Implementing computer vision to automatically detect the severity of an issue (e.g., depth of a pothole) directly from the uploaded image.
*   **Gamification:** Introducing a points and badge system to reward citizens who actively report valid issues, encouraging greater community participation.
*   **Multilingual Support:** Adding support for regional languages to ensure the platform is accessible to all demographics.
