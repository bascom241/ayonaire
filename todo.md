*LMS FUNCTIONALITY BREAKDOWN*

(Admin • Instructor • Student)


*AUTHENTICATION (ALL USERS)*

• User registration (email + password)
• ⁠Login / Logout
• ⁠Forgot password / Reset password
• Email verification
• Role-based access (Admin / Instructor / Student)


*ADMIN DASHBOARD*

1️⃣ User Management
• View all users (students and instructors)
• ⁠Create, edit, deactivate, suspend, or delete user accounts
• ⁠Assign or change user roles
• View user activity and login history


2️⃣ Instructor Management
• Approve or reject instructor applications
• View instructor profiles and activity
• Assign instructors to courses or classes
• Suspend or delete instructor accounts

3️⃣ Course Management
• Create, edit, publish, or unpublish courses // you have to upload modules to publish
• ⁠Assign instructors to courses
• ⁠Categorize courses (by subject, type, etc.) ## Category included the rest by frontend
• ⁠Upload course thumbnails and descriptions
• Monitor course engagement and completion rates
## Cant build course engagement unless we built progress trackink



3️⃣ Lesson & Content Management;
• Create modules and lessons;
• ⁠Upload videos (local or external links);
• ⁠Upload learning materials (PDF, DOC, etc.);
• ⁠Control lesson visibility (locked / unlocked);
• Set lesson order;

## Admin can create course but once the  course is assinged to an instructor he cant upload modules or lessons to that course 

4️⃣ Class / Cohort Management
• Create and manage classes or batches
• Assign students to classes
• Assign instructors to classes
• Schedule classes and lessons  // needs clarification on 


5️⃣ Enrollment Management
• Enroll or remove students from courses/classes
• ⁠View enrolled students per course
• ⁠Manually enroll or remove students
• View enrollment history
• ⁠Track course progress per student
• ⁠Track student course completion

5️⃣ Payment & Transactions (if enabled)
• View payment history
• View student purchases
• Manage pricing plans
• Payment gateway integration (e.g. Paystack, Stripe)

6️⃣ Reports & Analytics
• Total users
• Total enrollments
• Course completion stats
• mRevenue overview (if applicable)

6️⃣ Attendance Management
• View attendance for each class
• Edit or approve attendance entries
• ⁠Generate attendance reports


7️⃣ Assignment Management
• Create, edit, or delete assignments
• ⁠Assign assignments to courses or classes
• ⁠View student submissions
• Grade assignments

8️⃣ Quizzes & Assessments
• Monitor quizzes created by instructors
• ⁠View quiz results per student
• Export quiz results if needed


9️⃣ Reports & Analytics
• Platform-wide user stats (students, instructors)
• ⁠Course completion rates
• ⁠Revenue tracking (if monetized)
• ⁠Class and assignment analytics


10️⃣ Communication & Notifications
• Send announcements to all users or specific groups
• Manage email notifications and reminders


11️⃣ System Settings
• Manage LMS platform settings (branding, logos, colors)
• ⁠Configure payment gateways (Paystack, Stripe, etc.)
• Manage API keys and integrations
• Manage roles & permissions

12️⃣ Security & Maintenance
• Monitor logs and system activity
• ⁠Manage backups
• ⁠SSL and security settings




*INSTRUCTOR DASHBOARD*

1️⃣ Profile Management
• Edit personal profile
• Update profile picture
• Change password
• View overall teaching stats

2️⃣ Course Management
• Create, edit, publish, or unpublish courses
• Add course module, title, description, category, and image
• ⁠Upload course materials (videos, PDFs, audio, text)
• Organize content into lessons and topics
• Drip content / schedule lesson availability
• Set course pricing (if monetized

3️⃣ Lesson & Topic Management
• Add lessons and sub-lessons
• ⁠Upload media and resources
• Arrange lesson order
• ⁠Assign quizzes and assignments to lessons

4️⃣ Assignments
• Create assignments
• View student submissions
• ⁠Grade assignments and provide feedback
• ⁠Assign Proojects
• ⁠Assign Exams
• ⁠Set deadlines and requirements


5️⃣ Quizzes & Assessments
• Create quizzes for courses
• Set quiz types (multiple-choice, true/false, essay, etc.)
• View quiz results per student
• ⁠Retake policies

6️⃣ Student Management (Per Course)
• View enrolled students
• Track student progress per lesson or course
• View quiz results and assignment submissions
• Communicate with students via Q&A or messaging

7️⃣ Analytics & Reporting
• View course statistics (enrollments, completion rate, revenue if monetized)
• Track student engagement per course
• ⁠Download reports (PDF/CSV)

8️⃣ Communication
• Announce updates to students
• Answer questions in lesson discussion threads
• Send reminders for assignments or quizzes

9️⃣ Monetization / Earnings (If Enabled)
• View course earnings
• Track payouts
• ⁠Manage course pricing and discount codes

10️⃣ Notifications
• Course enrollment alerts
• Assignment submission notifications
• ⁠Quiz completion notifications


*STUDENT DASHBOARD*

🧑‍🎓 Student Profile
• View & edit profile information
• ⁠Upload profile photo
• Change password // require authentication 

📚 My Courses
• View all enrolled courses
• Course progress tracking
• Resume last lesson
• Course completion status

📖 Course Content
• View lessons (video, text, files)
• ⁠Download learning materials
• Navigate lessons easily
• ⁠Mark lessons as complete

📝 Assignments
• View assigned assignments
• Submit assignments (file upload or text)
• ⁠View instructor feedback
• ⁠Track assignment status

🧠 Quizzes
• Take quizzes
• ⁠View quiz results
• ⁠Retake quizzes (if allowed)

🏆 Certificates
• Automatically receive certificates after course completion using certificates ID
• ⁠Should be sharable to Linkedln
• ⁠Download or share certificates

💬 Q&A / Discussions
• Ask questions under lessons
• ⁠Reply to discussions
• ⁠Engage with instructors

📊 Progress Tracking
• Overall course progress
• Lesson completion tracking

🔔 Notifications
• Course updates
• ⁠Assignment reminders
• Instructor announcements

6️⃣ Attendance (Custom Feature)
• Mark attendance for scheduled classes
• ⁠View attendance history

8️⃣ Communication & Community
• Community Forum / Groups:
• Join relevant discussion groups (per course or general)
• ⁠Post questions and comments
• Reply to peers and instructors
• ⁠Engage in knowledge-sharing discussions

Direct Messaging (Optional / Phase 2):

• Message instructors or classmates
• ⁠Receive replies and notifications


⚙️ GENERAL SYSTEM FEATURES
• Role-based access control (RBAC)
• ⁠Secure API authentication (JWT or session)
• ⁠Responsive design (mobile, tablet, desktop)
• Optimized performance
• ⁠Scalable architecture
• Logging & error handling










For the Admin Dashboard:

Do the following APIs:

1. User Management 
2. ⁠Intructor Management 
3. ⁠Course Management 
4. ⁠Lesson & Content Management 
5. ⁠Class/Cohort Management 
6. ⁠Enrollement Management 
7. ⁠Assignments Management 

For the Students Dashboard, Do the following APIs:

1. Student Profiles
2. ⁠My Course
3. ⁠Course Content
4. ⁠Assignments 


For the Instructor Dashboard, Do the following APIs:

1. Profile Management 
2. ⁠Course Management 
3. ⁠Lesson & Topic Management 
4. ⁠Assignments


// Apis to deploy
// 2 apis in coourse route   
// 3 apis in user route  
// 2 apis in payment route 


i want to build a career accelerator on this code base for student after finich learnin courses .. lets start first i  use can use a modrel token since i dont have currently u can use sample so when i want to include its easy and agsin carreer accelerator is on a distinct from the codebase but the same codebaseso i eant it well sturtured ..  now hepl me build the following apis and documen  1.) Ai Resume Generator 2.) Cover letter 3> ) Ayonaire resume jobs 4.) Likend import 5.) Ai portfolio Builder 6.) Ai Resume Builder 7.) Ai Skill Gap Analyzer  8.) Talent Market Place 9>) Create Freelance Profile 10.) Carerr Roadmap genrator 11.) Ai Interview 12.) Company Based Interview .. build all of these things what the students are going to need and it has to be very seamless


---

# DASHBOARD REALITY AUDIT — Fix Backlog (2026-08-01)

Full codebase sweep of `frontend/app/dashboard` (admin, instructor, student) and `backend/src`, screen by screen, checking whether each page renders real API data or hardcoded/mock data. Ordered by the priority the user set: **Student → Admin → Instructor (assignments → quiz → analytics → monetization)**.

Status key: 🟢 REAL — 🟡 PARTIAL (some real, some mock) — 🟠 MOCK (100% hardcoded, real hook may already exist unused) — 🔴 STUB (blank placeholder page, nothing built)

## 🚨 P0 — the flows called out as broken right now

- [ ] **Instructor can't upload video.** Backend endpoint is real (`POST /api/v1/lesson/upload-video`, multer array upload → Cloudinary, `lesson.controller.ts` / `lesson.service.ts`). Needs a live repro to find whether the break is: the upload UI in `instructor/courses/[courseId]` not calling the hook, a wrong multer field name, a missing course/module id, or a Cloudinary config issue. Not conclusively found by static audit — investigate first.
- [ ] **Student can't consume courses.** The course player itself (`student/courses/[courseSlug]`, `lesson-video-player.tsx`) is fully wired to real hooks (`useGetEnrolledCourseDetail`, `useCourseContent`, `useResumeLastLesson`, `useMarkLessonCompletedMutation`). Likely root cause is the item above — if instructors can't upload videos, lessons have no video content to consume. Fix video upload first, then re-test this.
- [ ] **Instructor profile not in sync with DB.**
  - `components/dashboard/profile/edit/edit-login-info-content.tsx` — "Save Changes" button has **no onClick handler at all**. Changing email/password does nothing, silently.
  - `components/dashboard/profile/profile-ranks-content.tsx:19` — hardcodes the title **"Admin"** for every user regardless of real role (shows on instructor profile too).
  - Profile tabs `profile-acheivements-content.tsx`, `profile-points-content.tsx`, `profile-timeline-content.tsx`, `profile-courses-content.tsx` — all 100% hardcoded (fake badges, fake "790 points", fake course list from the marketing catalog instead of real enrollments/courses taught).
  - `profile-view-content.tsx:86` — `popularity={3760}` hardcoded literal for every user.
- [ ] **Instructor dashboard overview using dummy data.** Two different things share this name:
  - Root overview (`instructor/page.tsx` + `_components/instructor-dashboard-analytics-cards.tsx`) is mostly **real** (Total Courses/Students from `useGetCourses`) — only "Assignments Pending" and "Average Rating" are placeholder `"-"` because no backend endpoint returns them yet.
  - `instructor/analytics-reporting` (the fuller analytics page) is **100% fake** — every stat card, all 3 charts, and both result tables are static arrays with zero hook imports. This is almost certainly what "dummy overview" refers to — needs a real rebuild, and the backend has no general course-analytics endpoint yet (only payment analytics exists), so this needs backend work too.

## 🏫 Student Dashboard

- [ ] `certificates/page.tsx` — 🔴 stub div. Real hooks exist unused (`hooks/api/use-certificates.ts`).
- [ ] `community/page.tsx` — 🔴 stub div. No backend feature exists for this yet.
- [ ] `feed/general-discussion`, `feed/introductions`, `feed/ask-for-help` — 🟠 fully hardcoded fake posts/stat cards, no hook calls (main `feed/page.tsx` itself is real and fully wired).
- [ ] `job-sessions` — 🟠 fully hardcoded, tab/date filters don't even filter the static list. No backend hook or endpoint exists for this feature at all.
- [ ] `quiz/[quizId]` (instructions/taking/result flow) — 🟠 100% hardcoded ("AI Engineering Quiz 1" for every quiz, fixed 30/30 result, fake countdown that never ticks). Real hooks (`useGetQuizById`, `useGetQuizResults`, `useSubmitQuizMutation`) exist and are simply never imported. Also: `quiz/page.tsx` list actions ("Attempt Now" etc.) just `console.log` — there is currently **no way to reach the quiz-taking flow from the quiz list at all**.
- [ ] `courses/[courseSlug]` sub-tabs — Notes (localStorage-only, no backend endpoint for notes), Q&A (`mockQuestions`, static), Reviews (`MOCK_REVIEWS`, static), Transcription (`MOCK_TRANSCRIPTION`, static), AI Assistant (`setTimeout` fake reply, no real API call). The player itself and Resources/Announcements tabs are real.
- [ ] `resume-builder` — persists to `localStorage` only (`STORAGE_KEY`), not the backend — no endpoint exists yet to save/list/delete resumes server-side.
- [ ] `messages` — real send/receive, but group-chat right sidebar (`student-group-sidebar.tsx`) shows fake members/attachments instead of the real room roster; composer rich-text toolbar buttons are dead.
- [ ] `profile` — same mock tabs as instructor profile above (achievements/points/ranks/timeline/courses-content/certificates all hardcoded); danger-zone Deactivate/Unsubscribe/Delete buttons do nothing.
- [ ] Shared `_components/student-dashboard-header.tsx:159-165` — notification bell hardcodes unread count `8` always.
- [ ] Shared `_components/student-home-sidebar-content.tsx` — several nav links point at routes that don't exist (`/dashboard/student/announcements`, `/introductions`, `/ask-for-help`, `/chatrooms`, `/resources`, `/leaderboard` instead of the real `/feed/...` paths) — dead links, 404 on click.
- [ ] `workshop` — real data, just one dead "Join" button with no href/onClick.

## 🛠️ Admin Dashboard ("profile and everything has a lot of dummy data")

- [ ] `admin/page.tsx` (main dashboard) — 🟠 100% hardcoded: analytics cards, enrolment chart, revenue chart, pending-actions list, system health, recent orders, recent enrolments, activity logs. None import any hook.
- [ ] `admin/profile` — same hardcoded tabs as student/instructor profile (achievements/points/ranks/timeline/courses), plus `popularity={3760}`.
- [ ] Fully stub pages (🔴 literally `<div>Page Here</div>`, real hooks already exist unused for most of these): `analytics`, `certificates`, `email-broadcast`, `projects` (no backend at all), `support`, `team`.
- [ ] `notifications` (main + `create` + `global-reminder` + `history`) — 🟠 all four screens run on local mock files despite a complete real CRUD hook set (`hooks/api/use-notifications.ts`) existing and never being imported.
- [ ] `payments/pricing-plans` and `payments/student-purchases` — 🟠 both 100% mock arrays; real hooks (`useGetPricingPlans`, `useGetStudentPurchases`, mutations) exist unused.
- [ ] `orders/[id]` (order detail) — 🟠 looks up the order from a local `mockOrders` array instead of the real payment record the list page already fetches — clicking into a real order shows wrong/fabricated data.
- [ ] `enrollments` — 🟡 list uses the **wrong hook** (`useGetEnrolledCourses`, which is the student's-own-courses endpoint) instead of the admin-wide `useGetAllEnrollments` that already exists for this — will show empty/wrong data. The whole "Enroll Students" modal flow (student picker, course picker, CSV upload, progress bar) is simulated end-to-end and never calls the real enroll mutations.
- [ ] `attendance/session` and `attendance/view` — 🟠 both render hardcoded fake student lists (`mockSessionAttendance`, `mockStudentAttendance`); `attendance/list` and `attendance/reports` are already real.
- [ ] `system-settings/license` — 🟠 "License Activated" badge, domain, expiration date, license type are all hardcoded strings, not read from any settings API.
- [ ] `system-settings/design` and `system-settings/email` — 🟡 mostly real toggle/select cards, but the logo-upload dropzone and two "action" cards (Default Configuration / Manual Email) have no click handler wired.
- [ ] Recurring dead buttons across otherwise-real pages: "View Details"/"Edit"/"Filters"/"Apply"/bulk "Approve"/"Cancel" — frequently either `toast.info("...isn't available yet")` or no `onClick` at all, even on `users`, `courses`, `announcements`, `instructors`.

## 👩‍🏫 Instructor Dashboard — assignments → quiz → analytics → monetization

- [x] **Assignments** — already real. `assignments/page.tsx`, table/list, and `create` flow all call real hooks (`useGetAssignments`, `useCreateAssignmentMutation`, `useUpdateAssignmentMutation`, `useDeleteAssignmentMutation`). Only gap: "Edit" is an honest `toast.info("...isn't available yet")` stub — no edit-assignment UI exists yet. Dead `mockAssignments`/`mockInstructorAssignments` arrays in `assignments-data.ts` are unused and can be deleted.
- [x] **Quiz** — already real. List/create/delete all call real hooks (`useGetQuizzes`, `useCreateQuizMutation`, `useCreateQuizQuestionMutation`, `useDeleteQuizMutation`). Gaps: "Edit" and "Analytics" are honest stub toasts (no edit-quiz or per-quiz-analytics UI built yet); "All Quizzes/Drafts/Active" filter tabs render but do nothing; Export buttons have no handler.
- [ ] **Analytics-reporting** (main + `/course`) — 🟠 100% hardcoded: overview cards ("$124k" revenue, "84/100" avg quiz score), 3 static Recharts charts, and both results tables (`tableData`, `detailedAnalyticsData`). **Needs a new backend endpoint** — nothing in `instructorDashboard.route.ts` currently returns per-course completion rate, quiz-score trend, or revenue-over-time; only the top-level `dashboard/stats` summary exists.
- [ ] **Monetization** (main + `course-revenue` + `payout-history`) — 🟠 100% hardcoded across all 3 pages (`$124,500.50` earnings, `dummyRevenueData`, `dummyPayoutData`, fake coupon codes, fake "Next Payout... Bank Transfer **** 4242"). Real `hooks/api/use-payments.ts` (`useGetPaymentAnalytics`, `useGetAllPayments`) exists but is never imported here, and even that hook is admin-wide, not instructor-scoped or per-course. **Backend gap:** no payout/withdrawal endpoint exists at all — `payment.route.ts` has admin-wide payment analytics and order management, but nothing for "how much does this instructor personally get paid out, and when." Since this is Paystack-based, payouts likely need a real payout/split model (e.g. Paystack Subaccounts / Transfers) designed before the frontend can be wired to anything real.
- [ ] `communication/messages` (+ `[messageId]`) — 🟠 100% mock (`_data/mock-messages.ts`), despite a fully working `hooks/api/use-messages.ts` (`useGetMessages`, `useSendMessageMutation`) existing and never being imported.
- [ ] `students-management/course-module` and `/performance-results` — 🟠 both hardcoded (`DUMMY_LESSONS`, `DUMMY_ASSIGNMENTS`, `DummyQuizResultsAttempts`); neither route even has a student/course URL param, so they can't show per-student data even once wired up. Main `students-management` page itself is already real.
- [ ] `profile` / `profile/edit` — same gaps as the instructor-profile P0 items above (login-info Save button dead, mock achievement/points/ranks/timeline/courses tabs).
- [ ] `notifications` — no fake data shown (honest empty state), but the real `hooks/api/use-notifications.ts` is never imported here either, and "Mark all as read" has no handler.

## 🔩 Backend gaps that block frontend fixes

- [ ] No general **course/platform analytics** endpoint (needed for instructor `analytics-reporting` and admin `analytics`) — only `GET /api/v1/payment/analytics` (revenue-only) exists today.
- [ ] No **payout/withdrawal** model or endpoint for instructors (needed for `monetization`/`payout-history`) — needs a Paystack Transfers/Subaccount design decision before building.
- [ ] No **admin-wide dashboard summary** endpoint (per-instructor `dashboard/stats` exists, nothing platform-wide).
- [ ] `cohort`, `lesson`, `module`, `room`, `message` domains are missing update/delete endpoints for their main resource (can create but not edit/remove) — relevant if the "fix everything" pass touches course/module editing.
- [ ] `paymentGateway.service.ts:31-47` stores the Paystack/Stripe **secret key in plaintext** in the DB — flagging since this is a real-money integration; worth encrypting at rest while touching this area.
- [ ] `team.service.ts` "list team members" only returns `role: admin`, so instructors invited via the same Team feature never show up in the list — likely a bug, not intentional scoping.
- [ ] `models/adminProfile.model.ts` and 5 functions in `services/enroll.service.ts` are orphaned/unused dead code (one, `enrolledStudentsPerCourse`, has a live bug — reads `enrollment.name` instead of `enrollment.student.name`) — safe to delete or worth fixing if ever wired up.