
<img width="1732" height="892" alt="image" src="https://github.com/user-attachments/assets/4a68d861-500f-4601-a68a-445a199e72a2" />
<img width="1882" height="902" alt="image" src="https://github.com/user-attachments/assets/4f8e64ea-c81e-4200-8c16-f3fa47feaa43" />
<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/fc00a5f4-64c8-4ef4-bfd1-649f9eec3ff3" />
<img width="1902" height="897" alt="image" src="https://github.com/user-attachments/assets/0690291c-1bdd-4cab-8abd-2f1e44f13924" />
<img width="1875" height="897" alt="image" src="https://github.com/user-attachments/assets/43c1b7a0-1e12-40f3-ab7a-5d7dc1899b63" />
<img width="1888" height="905" alt="image" src="https://github.com/user-attachments/assets/b5664202-cdcb-42b0-9c4d-da74f4465a81" />
<img width="1888" height="917" alt="image" src="https://github.com/user-attachments/assets/dba9ddbc-4090-42a4-965c-bcbab2c4f542" />

**# 🏦 Dashen Bank - Exchange Rate Management System**

A comprehensive web application for managing daily foreign exchange rates, built for Dashen Bank S.C. This system provides administrative controls for updating and monitoring currency exchange rates.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎯 Overview

The Dashen Bank Exchange Rate Management System is designed to streamline the process of managing daily foreign currency exchange rates. It provides an intuitive admin panel for bank staff to update, monitor, and publish exchange rates efficiently.

### Key Objectives
- Centralized exchange rate management
- Real-time rate updates
- Secure administrative access
- Audit logging for compliance
- User-friendly interface for banking operations

## ✨ Features

### Current Features
- ✅ **Admin Authentication** - Secure login system with session management
- ✅ **Exchange Rate Management** - CRUD operations for currency rates
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Amharic & English Support** - Bilingual interface
- ✅ **Real-time Updates** - Instant rate changes
- ✅ **Audit Trail** - Logs all system activities
- ✅ **Security Features** - Protected routes and session handling

### Upcoming Features
- 🔄 Export rates to PDF/Excel
- 📊 Historical rate charts
- 📧 Email notifications for rate changes
- 🔔 Rate alert system
- 📱 Mobile app integration
- 🌐 API endpoints for external systems

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router DOM v6** - Navigation and routing
- **Axios** - HTTP client
- **Font Awesome** - Icons
- **CSS3** - Custom styling with modern features

### Backend (Assumed)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **PostgreSQL / MySQL** - Database

### Development Tools
- **Git** - Version control
- **npm / yarn** - Package management
- **VS Code** - Recommended IDE

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

```bash
node.js >= 14.0.0
npm >= 6.0.0 or yarn >= 1.22.0
git


Installation
1. Clone the repository
bash

git clone https://github.com/yourusername/dashen-bank-exchange-rate.git
cd dashen-bank-exchange-rate

2. Install dependencies
bash

npm install
# or
yarn install

3. Install additional required packages
bash

npm install react-router-dom axios
npm install @fortawesome/fontawesome-free

4. Set up environment variables

Create a .env file in the root directory:
env

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_SECRET=your_secret_key_here
REACT_APP_ENVIRONMENT=development

5. Start the development server
bash

npm start
# or
yarn start

The application will open at http://localhost:3000
📁 Project Structure
text

dashen-bank-exchange-rate/
│
├── public/
│   ├── index.html
│   └── images/
│       └── logo.jpg
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   └── Loader.js
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminLogin.css
│   │   │   ├── AdminPanel.js
│   │   │   └── ExchangeRateTable.js
│   │   │
│   │   └── layout/
│   │       ├── Header.js
│   │       ├── Sidebar.js
│   │       └── Footer.js
│   │
│   ├── context/
│   │   └── AuthContext.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.js
│   ├── App.css
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
├── README.md
└── LICENSE

🔐 Authentication
Default Admin Credentials (Development Only)
text

Username: admin
Password: admin123

⚠️ IMPORTANT: Change these credentials immediately in production!
Authentication Flow

    User enters credentials on login page

    System validates against backend API

    JWT token is generated and stored

    User is redirected to admin panel

    Token is verified for protected routes
