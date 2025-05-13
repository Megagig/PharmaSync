# PharmaSync

A professional pharmaceutical care web application for pharmacists in Nigeria.

## Features

### Pharmacist-Centered Features
- Medication Therapy Management (MTM)
- Patient Profile Management
- Drug Interaction Checker
- eCounseling & Patient Notes
- Clinical Decision Support

### Business/Operational Tools
- Inventory Management
- Sales & POS Module
- Drug Pricing & Discounting
- Staff Roles & Permissions
- Reports & Analytics

### Patient-Facing Add-Ons
- Online Prescription Upload
- Appointment Scheduling
- SMS/WhatsApp Reminders

### Regulatory & Safety
- Pharmacovigilance Reporting
- Compliance Features
- Data Security & Backup

## Tech Stack
- MongoDB: Database
- Express: Backend framework
- React: Frontend library
- Node.js: Runtime environment
- TypeScript: Programming language

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/pharmasync.git
cd pharmasync
```

2. Install dependencies
```
npm run install:all
```

3. Set up environment variables
Create `.env` files in both the client and server directories based on the provided examples.

4. Start the development server
```
npm run dev
```

## Project Structure
```
pharmasync/
├── client/                 # Frontend React app
├── server/                 # Backend Node.js/Express app
├── shared/                 # Shared code between client/server
└── ...
```

## License
[ISC](LICENSE)
