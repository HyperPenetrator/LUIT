# Water Quality Monitor Integration

This document describes the integration of the Water Quality Monitor frontend from the `water-quality-monitor` project into the LUIT application.

## Overview

The Water Quality Monitor has been successfully integrated into the LUIT application as a separate module accessible at `/water-quality` routes.

## What Was Done

### 1. Frontend Components Created

Three new React pages were created in `d:\SIH 1.0\LUIT\frontend\src\pages\`:

- **WaterQualityHome.jsx** - Landing page showing:
  - Welcome message and app description
  - District-based area status checker
  - Statistics (total, active, resolved reports)
  - Recent reported issues
  - Quick report button

- **WaterQualityReport.jsx** - Report submission page with:
  - Problem description field
  - GPS location capture
  - District selection (Assam districts)
  - Severity level selection (safe, caution, unsafe, critical)
  - Water source type selection
  - Pin code and contact number (optional)
  - SMS reporting option

- **WaterQualityLogin.jsx** - Authentication page for:
  - PHC (Primary Health Center) accounts
  - Water Treatment Lab accounts
  - Registration and login functionality

### 2. Styling

Created `d:\SIH 1.0\LUIT\frontend\src\styles\water-quality.css` with:
- All styles prefixed with `wq-` to avoid conflicts with existing LUIT styles
- Responsive design for mobile and desktop
- Modal components for status checking
- Form styling consistent with the original design

### 3. Routing

Updated `d:\SIH 1.0\LUIT\frontend\src\App.jsx` to include:
- `/water-quality` - Home page
- `/water-quality/report` - Report issue page
- `/water-quality/login` - Login/Register page

### 4. Backend Integration

The components are connected to the existing LUIT backend API:

- **Report Submission**: Uses `/reporting/report` endpoint
- **Report Fetching**: Uses `/reporting/reports` endpoint
- **Authentication**: Uses `/auth/login` and `/auth/register` endpoints

### 5. API Schema Mapping

The frontend data is mapped to match the LUIT backend schema:

```javascript
// Frontend form data → Backend API
{
  latitude: float,          // Parsed from GPS location
  longitude: float,         // Parsed from GPS location
  village: string,          // Location name
  contaminationType: enum,  // Mapped to backend enum
  waterSource: string,      // Water source type
  severityLevel: enum,      // safe | caution | unsafe | critical
  description: string,      // Problem description
  reportedBy: null,         // Anonymous for now
  userName: 'Anonymous',
  affectedPopulation: 0
}
```

## How to Access

1. **Start the backend**:
   ```bash
   cd "d:\SIH 1.0\LUIT\backend"
   python main.py
   ```

2. **Start the frontend**:
   ```bash
   cd "d:\SIH 1.0\LUIT\frontend"
   npm run dev
   ```

3. **Navigate to**:
   - Home: http://localhost:5173/water-quality
   - Report: http://localhost:5173/water-quality/report
   - Login: http://localhost:5173/water-quality/login

## Features

### Public Features
- View water quality statistics
- Check area status by district
- View recent reports
- Submit new water quality reports
- GPS location capture
- SMS reporting option

### Authenticated Features (PHC/Water Lab)
- Login/Register for PHC and Water Treatment Labs
- Access to dashboards (to be implemented)
- Manage reports for their district

## Environment Variables

The frontend uses the following environment variable:
- `VITE_API_URL` - Backend API URL (defaults to http://localhost:5000)

## Districts Supported

All Assam districts are supported:
- Kamrup, Dibrugarh, Jorhat, Nagaon, Sonitpur, Tinsukia
- Barpeta, Cachar, Golaghat, Sivasagar, Dhemaji, Lakhimpur
- Darrang, Kokrajhar, Bongaigaon, Karbi Anglong, Dima Hasao
- Goalpara, Dhubri, Morigaon

## Next Steps

To complete the integration, you may want to:

1. **Create PHC Dashboard** - A page for PHC users to view and manage reports in their district
2. **Create Water Lab Dashboard** - A page for water lab users to view test results and update report status
3. **Add Image Upload** - Allow users to upload photos of contamination
4. **Implement SMS Integration** - Connect the SMS feature to actual SMS gateway
5. **Add Map View** - Display reports on a map using Leaflet (already available in LUIT)
6. **Add Notifications** - Alert PHC/Labs when new reports are submitted in their district

## File Structure

```
d:\SIH 1.0\LUIT\frontend\src\
├── pages/
│   ├── WaterQualityHome.jsx
│   ├── WaterQualityReport.jsx
│   └── WaterQualityLogin.jsx
├── styles/
│   └── water-quality.css
├── App.jsx (updated)
└── main.jsx (updated)
```

## Notes

- The water quality monitor is fully integrated but operates as a separate module
- All existing LUIT functionality remains unchanged
- The styling is isolated with `wq-` prefix to prevent conflicts
- The backend API endpoints are reused from the existing LUIT backend
- Authentication integrates with the existing LUIT auth system
