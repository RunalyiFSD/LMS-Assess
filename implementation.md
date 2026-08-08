# Instructor Mock Assessment Assignment Plan

Add a dedicated **"Mock Assessments"** tab to the instructor's dashboard where instructors can browse company & language mock templates, configure parameters (Duration, Passing Score, Due Date, Target Batch/Students), and publish them as assigned assessments.

---

## Technical Summary of Changes

1. **Sidebar Navigation (`Sidebar.jsx`)**:
   - Add `{ to: '/instructor/mock-assignments', label: 'Mock Assessments', icon: <Building2 size={18} /> }` for instructors.

2. **App Router (`App.jsx`)**:
   - Register route `/instructor/mock-assignments` mapped to `<ProtectedRoute allowedRoles={['instructor', 'admin']}><Dashboard /></ProtectedRoute>`.

3. **Instructor Dashboard (`InstructorDashboardView.jsx`)**:
   - Add `activeTab === 'mock_assignments'` tab handling.
   - Add tab button in sub-navigation bar.
   - Render mock templates grid (Company Aptitude & Tech Stack cards).
   - Render **Configure & Assign Modal**:
     - Auto-loads company questions (LeetCode + Aptitude seeds).
     - Allows setting duration, passing score, due date, target audience (all / batch / specific students).
     - Calls backend `POST /api/leetcode/create-mock`.
   - Render **Assigned Mocks Table**: List of mock assessments assigned by the instructor.

4. **Backend Endpoint (`leetcodeController.js` & `leetcodeRoutes.js`)**:
   - Restrict `POST /api/leetcode/create-mock` to instructor/admin.
   - Accept config parameters (`duration`, `passingScore`, `dueDate`, `assignmentType`, `assignedBatch`, `assignedStudents`).
   - Create valid `Assessment` matching schema.

5. **Student Dashboard (`StudentDashboardView.jsx`)**:
   - Keep student explore mocks cards, but for preset templates present a clear "Request / View Details" status or filter by instructor-assigned mocks.
   - Instructors assign, students attempt assigned mocks.
