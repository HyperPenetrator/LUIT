# MASTER PROMPT: Water Quality Dashboards & Image Upload Implementation

## Context
You are working on the LUIT water quality monitoring application. The basic Water Quality Monitor has been integrated with three pages (Home, Report, Login). Now you need to implement three advanced features:

1. **PHC Dashboard** - For Primary Health Centers to manage district reports
2. **Water Lab Dashboard** - For water testing labs to add test results  
3. **Image Upload** - Allow users to upload photos of contamination

## Project Structure
```
d:\SIH 1.0\LUIT\
├── backend/          # FastAPI backend with Firebase/Firestore
│   ├── routes/       # API routes (reporting.py, auth.py, labs.py)
│   └── services/     # Cloudinary, Firebase services
└── frontend/         # React + Vite frontend
    └── src/
        ├── pages/    # React pages
        ├── components/
        └── styles/   # CSS files
```

## Existing Integration
- Water Quality pages at `/water-quality/*` routes
- Backend API at `/reporting/*` endpoints
- Cloudinary already integrated for image uploads
- Firebase Auth for user authentication
- User roles: `individual`, `ngo`, `phc`, `waterlab`

---

## TASK 1: Create PHC Dashboard

### Requirements
Create a dashboard for PHC (Primary Health Center) users to manage water quality reports in their assigned district.

### Component: `PHCDashboard.jsx`
**Location**: `d:\SIH 1.0\LUIT\frontend\src\pages\PHCDashboard.jsx`

**Features to Implement**:
1. Display all reports from PHC's district (filter by `district` field)
2. Show statistics: Pending, Verified, Resolved counts
3. Filter reports by status, severity, water source
4. View detailed report with images
5. Update report status (pending → verified → resolved)
6. Forward reports to water labs with notes
7. Upload PDF documents (lab requests, official notices)
8. Search functionality by location/description

**UI Layout**:
```jsx
<div className="wq-container">
  <header>
    <h1>PHC Dashboard - {user.district}</h1>
    <div className="stats-grid">
      <StatCard label="Pending" count={pendingCount} />
      <StatCard label="Verified" count={verifiedCount} />
      <StatCard label="Resolved" count={resolvedCount} />
    </div>
  </header>

  <div className="filters">
    <select name="status">...</select>
    <select name="severity">...</select>
    <input type="search" placeholder="Search..." />
  </div>

  <div className="reports-grid">
    {reports.map(report => (
      <ReportCard 
        report={report}
        onView={handleViewDetails}
        onForward={handleForwardToLab}
        onUpdateStatus={handleUpdateStatus}
      />
    ))}
  </div>

  <ReportDetailModal 
    report={selectedReport}
    onClose={closeModal}
  />
</div>
```

**API Endpoints to Use**:
- `GET /reporting/reports?district={district}` - Fetch district reports
- `PUT /reporting/reports/{id}` - Update report status
- `POST /reporting/forward` - Forward to lab (create if doesn't exist)
- `POST /reporting/upload-image` - Upload PDFs via Cloudinary

**Authentication**:
- Check user role is `phc`
- Get district from `user.district`
- Redirect non-PHC users to login

**Styling**:
- Use existing `wq-` prefixed classes from `water-quality.css`
- Add new classes for dashboard-specific elements
- Ensure responsive design for mobile

---

## TASK 2: Create Water Lab Dashboard

### Requirements
Create a dashboard for water testing labs to receive forwarded reports and add test results.

### Component: `WaterLabDashboard.jsx`
**Location**: `d:\SIH 1.0\LUIT\frontend\src\pages\WaterLabDashboard.jsx`

**Features to Implement**:
1. Display reports forwarded from PHCs
2. Show pending tests count
3. View report details with images and PHC notes
4. Add test results form:
   - Contamination type (arsenic, fluoride, bacteria, etc.)
   - Contamination levels (ppm, pH, turbidity)
   - Test date
   - Recommendations
5. Upload test report PDF
6. Update report status to `verified` or `clean`
7. View test history for specific locations

**UI Layout**:
```jsx
<div className="wq-container">
  <header>
    <h1>Water Lab Dashboard - {user.facilityName}</h1>
    <div className="stats">
      <StatCard label="Pending Tests" count={pendingTests} />
    </div>
  </header>

  <div className="reports-list">
    {reports.map(report => (
      <div className="report-card">
        <ReportInfo report={report} />
        <PHCNotes notes={report.forwardNotes} />
        
        <TestResultsForm
          reportId={report.id}
          onSubmit={handleSubmitResults}
        >
          <select name="contaminationType">...</select>
          <input name="arsenicLevel" type="number" />
          <input name="fluorideLevel" type="number" />
          <input name="pH" type="number" />
          <input name="turbidity" type="number" />
          <input name="testDate" type="date" />
          <textarea name="recommendations" />
          <FileUpload label="Upload Test Report PDF" />
          <select name="finalStatus">
            <option value="clean">Clean</option>
            <option value="contaminated">Contaminated</option>
          </select>
          <button type="submit">Submit Results</button>
        </TestResultsForm>
      </div>
    ))}
  </div>
</div>
```

**API Endpoints to Use**:
- `GET /labs/reports?labId={labId}` - Fetch assigned reports (create if doesn't exist)
- `POST /labs/test-results` - Submit test results (create if doesn't exist)
- `PUT /reporting/reports/{id}` - Update report status
- `POST /reporting/upload-image` - Upload test report PDF

**Data Model for Test Results**:
```javascript
{
  reportId: string,
  contaminationType: 'arsenic' | 'fluoride' | 'bacteria' | 'turbidity' | 'other',
  levels: {
    arsenic: number,      // ppm
    fluoride: number,     // ppm
    pH: number,
    turbidity: number,    // NTU
    bacteria: number      // CFU/100ml
  },
  testDate: ISO date string,
  pdfUrl: string,         // Cloudinary URL
  finalStatus: 'clean' | 'contaminated',
  recommendations: string
}
```

**Authentication**:
- Check user role is `waterlab`
- Get lab ID from `user.id`
- Redirect non-lab users to login

---

## TASK 3: Add Image Upload Functionality

### Requirements
Allow users to upload photos when reporting water quality issues.

### Component Updates

#### 1. Create Reusable Image Upload Component
**Location**: `d:\SIH 1.0\LUIT\frontend\src\components\ImageUpload.jsx`

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function ImageUpload({ onImagesChange, maxImages = 3 }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, maxImages);
    
    for (const file of files) {
      // Compress image
      const compressed = await compressImage(file);
      
      // Convert to base64
      const base64 = await fileToBase64(compressed);
      
      // Upload to Cloudinary via backend
      const result = await uploadImage(base64);
      
      setImages(prev => [...prev, result]);
    }
    
    onImagesChange(images);
  };

  const uploadImage = async (base64) => {
    const response = await axios.post('/reporting/upload-image', {
      image_base_64: base64
    });
    return response.data;
  };

  return (
    <div className="image-upload">
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleFileSelect}
        disabled={images.length >= maxImages}
      />
      
      <div className="image-previews">
        {images.map((img, idx) => (
          <div key={idx} className="image-preview">
            <img src={img.url} alt={`Upload ${idx + 1}`} />
            <button onClick={() => removeImage(idx)}>×</button>
          </div>
        ))}
      </div>
      
      {uploading && <div className="loading">Uploading...</div>}
    </div>
  );
}

// Helper functions
async function compressImage(file) {
  // Use browser-image-compression library or canvas API
  // Target: max 1MB, max 1920x1080
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

#### 2. Update WaterQualityReport.jsx
**Location**: `d:\SIH 1.0\LUIT\frontend\src\pages\WaterQualityReport.jsx`

**Changes**:
1. Import `ImageUpload` component
2. Add state for uploaded images
3. Include images in report submission
4. Add image upload field to form

```jsx
// Add to imports
import ImageUpload from '../components/ImageUpload';

// Add to state
const [uploadedImages, setUploadedImages] = useState([]);

// Update handleSubmit to include images
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const [lat, lng] = formData.gpsLocation.split(',').map(s => parseFloat(s.trim()));

    const reportData = {
      latitude: lat,
      longitude: lng,
      village: formData.locationName,
      contaminationType: 'other',
      waterSource: formData.sourceType.toLowerCase().replace(' ', '_'),
      severityLevel: formData.severity.toLowerCase(),
      description: formData.problem,
      reportedBy: null,
      userName: 'Anonymous',
      affectedPopulation: 0,
      // Add image URLs
      imageUrl: uploadedImages[0]?.url || null,
      imagePublicId: uploadedImages[0]?.public_id || null,
      additionalImages: uploadedImages.slice(1).map(img => ({
        url: img.url,
        publicId: img.public_id
      }))
    };

    await axios.post(`${API_URL}/reporting/report`, reportData);
    
    setSuccess(true);
    setTimeout(() => navigate('/water-quality'), 3000);
  } catch (error) {
    console.error('Error submitting report:', error);
    alert('Error submitting report. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Add to form JSX (after Contact Number field)
<div className="wq-form-group">
  <label className="wq-form-label">Upload Photos (Optional)</label>
  <ImageUpload 
    onImagesChange={setUploadedImages}
    maxImages={3}
  />
  <small style={{ color: 'var(--wq-text-secondary)', fontSize: '12px' }}>
    Upload up to 3 photos of the water quality issue
  </small>
</div>
```

#### 3. Update WaterQualityHome.jsx
**Location**: `d:\SIH 1.0\LUIT\frontend\src\pages\WaterQualityHome.jsx`

**Changes**:
1. Display images in report cards
2. Add image count badge
3. Add image lightbox/modal for viewing

```jsx
// In report card rendering
<div className="wq-report-item">
  <div className="wq-report-header">
    <div className="wq-report-info">
      <div className="wq-report-location">{report.village}</div>
      <div className="wq-report-meta">
        {report.district} • {report.severityLevel} Severity
      </div>
    </div>
    <span className={`wq-status-badge wq-status-${report.status}`}>
      {report.status}
    </span>
  </div>
  
  {/* Add image preview */}
  {report.imageUrl && (
    <div className="report-images">
      <img 
        src={report.imageUrl} 
        alt="Report" 
        onClick={() => openImageModal(report.imageUrl)}
        className="report-thumbnail"
      />
      {report.additionalImages?.length > 0 && (
        <span className="image-count-badge">
          +{report.additionalImages.length}
        </span>
      )}
    </div>
  )}
  
  <p className="wq-report-description">{report.description}</p>
</div>
```

#### 4. Create Image Gallery Component
**Location**: `d:\SIH 1.0\LUIT\frontend\src\components\ImageGallery.jsx`

```jsx
export default function ImageGallery({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="wq-modal active" onClick={onClose}>
      <div className="image-gallery-content" onClick={e => e.stopPropagation()}>
        <button className="wq-close-btn" onClick={onClose}>×</button>
        
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="gallery-image"
        />
        
        <div className="gallery-controls">
          <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
            ← Previous
          </button>
          <span>{currentIndex + 1} / {images.length}</span>
          <button onClick={() => setCurrentIndex(i => Math.min(images.length - 1, i + 1))}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## ROUTING UPDATES

Update `d:\SIH 1.0\LUIT\frontend\src\App.jsx`:

```jsx
// Add imports
const PHCDashboard = lazy(() => import('./pages/PHCDashboard'))
const WaterLabDashboard = lazy(() => import('./pages/WaterLabDashboard'))

// Add routes
<Route path="/water-quality/phc-dashboard" element={
  user?.role === 'phc' ? <PHCDashboard /> : <Navigate to="/water-quality/login" />
} />
<Route path="/water-quality/lab-dashboard" element={
  user?.role === 'waterlab' ? <WaterLabDashboard /> : <Navigate to="/water-quality/login" />
} />
```

Update `d:\SIH 1.0\LUIT\frontend\src\pages\WaterQualityLogin.jsx`:

```jsx
// In handleLogin function, update redirect logic
if (user.role === 'phc') {
  navigate('/water-quality/phc-dashboard');
} else if (user.role === 'waterlab') {
  navigate('/water-quality/lab-dashboard');
} else {
  navigate('/water-quality');
}
```

---

## BACKEND API ENDPOINTS TO CREATE (if they don't exist)

### 1. Forward Report to Lab
```python
# File: d:\SIH 1.0\LUIT\backend\routes\reporting.py

@router.post("/forward")
async def forward_report_to_lab(request: ForwardRequest):
    """Forward a report from PHC to water lab"""
    try:
        report = get_document("waterReports", request.reportId)
        
        # Update report with forwarding info
        report['forwardedTo'] = request.labId
        report['forwardNotes'] = request.notes
        report['forwardedAt'] = datetime.now().isoformat()
        report['priority'] = request.priority
        report['status'] = 'testing'
        
        # Update in Firestore
        update_document("waterReports", request.reportId, report)
        
        # Notify lab (optional)
        # send_notification(request.labId, f"New report forwarded: {report['village']}")
        
        return {"success": True, "message": "Report forwarded to lab"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### 2. Submit Test Results
```python
# File: d:\SIH 1.0\LUIT\backend\routes\labs.py (create if doesn't exist)

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter(prefix="/labs", tags=["labs"])

class TestResultsRequest(BaseModel):
    reportId: str
    contaminationType: str
    levels: Dict[str, float]
    testDate: str
    pdfUrl: Optional[str] = None
    finalStatus: str
    recommendations: str

@router.post("/test-results")
async def submit_test_results(request: TestResultsRequest):
    """Submit test results for a water quality report"""
    try:
        report = get_document("waterReports", request.reportId)
        
        # Add test results
        report['testResults'] = {
            'contaminationType': request.contaminationType,
            'levels': request.levels,
            'testDate': request.testDate,
            'pdfUrl': request.pdfUrl,
            'recommendations': request.recommendations,
            'testedAt': datetime.now().isoformat()
        }
        report['status'] = request.finalStatus
        report['verified'] = True
        
        # Update in Firestore
        update_document("waterReports", request.reportId, report)
        
        return {"success": True, "message": "Test results submitted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports")
async def get_lab_reports(labId: str):
    """Get reports assigned to a specific lab"""
    try:
        from services.firebase_service import query_documents
        reports = query_documents("waterReports", "forwardedTo", "==", labId)
        return {"success": True, "reports": reports}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### 3. Register Routes in main.py
```python
# File: d:\SIH 1.0\LUIT\backend\main.py

from routes import labs  # Add this import

app.include_router(labs.router)  # Add this line
```

---

## CSS ADDITIONS

Add to `d:\SIH 1.0\LUIT\frontend\src\styles\water-quality.css`:

```css
/* Dashboard Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

/* Image Upload Styles */
.image-upload {
  border: 2px dashed var(--wq-border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.image-previews {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-preview button {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--wq-danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* Report Images */
.report-images {
  position: relative;
  margin: 10px 0;
}

.report-thumbnail {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

.image-count-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Image Gallery Modal */
.image-gallery-content {
  max-width: 90vw;
  max-height: 90vh;
}

.gallery-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.gallery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

/* Test Results Form */
.test-results-form {
  background: var(--wq-bg-secondary);
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}
```

---

## EXECUTION ORDER

1. **Backend First** (if endpoints don't exist):
   - Create `labs.py` route file
   - Add forward and test results endpoints
   - Register in `main.py`
   - Test with Postman/curl

2. **Image Upload Component**:
   - Create `ImageUpload.jsx`
   - Create helper functions for compression
   - Test standalone

3. **Update Report Form**:
   - Integrate `ImageUpload` into `WaterQualityReport.jsx`
   - Update submission logic
   - Test image upload flow

4. **PHC Dashboard**:
   - Create `PHCDashboard.jsx`
   - Implement filtering and status updates
   - Add forward to lab functionality
   - Test with PHC user account

5. **Water Lab Dashboard**:
   - Create `WaterLabDashboard.jsx`
   - Implement test results form
   - Add PDF upload
   - Test with lab user account

6. **Integration Testing**:
   - Test complete workflow: citizen → PHC → lab
   - Verify image display across all pages
   - Test on mobile devices

---

## TESTING CHECKLIST

- [ ] Images upload successfully to Cloudinary
- [ ] Images display in report cards
- [ ] Image gallery/lightbox works
- [ ] PHC can view district reports only
- [ ] PHC can forward reports to labs
- [ ] Lab receives forwarded reports
- [ ] Lab can submit test results
- [ ] Report status updates correctly
- [ ] PDF uploads work
- [ ] Authentication/authorization works
- [ ] Mobile responsive design
- [ ] Error handling for failed uploads
- [ ] Loading states during uploads

---

## DEPENDENCIES TO INSTALL

```bash
cd "d:\SIH 1.0\LUIT\frontend"
npm install browser-image-compression
```

---

## SUCCESS CRITERIA

✅ Users can upload up to 3 images when reporting issues
✅ Images display in report cards and detail views
✅ PHC users can access dashboard and manage district reports
✅ PHC users can forward reports to water labs
✅ Water lab users can access dashboard and view assigned reports
✅ Water lab users can submit test results with PDFs
✅ Complete workflow works: citizen report → PHC review → lab testing → resolution
✅ All features work on mobile and desktop
✅ Proper authentication and authorization in place

---

## NOTES

- Use existing Cloudinary integration (already in backend)
- Follow existing code style and patterns
- Reuse `wq-` CSS classes where possible
- Add loading states for all async operations
- Include error handling and user feedback
- Consider adding email notifications (optional)
- Test with real user accounts for each role
