export const ANTIGRAVITY_SPEC = `# Antigravity App Specification & Blueprint: EduSync Faculty Portal

> **Target Agent**: Google AI Studio / Antigravity Agent  
> **Application**: EduSync — Comprehensive University Faculty Portal & Lecture Management System  
> **Tech Stack**: React 19 / React 18, TypeScript, Tailwind CSS v4, Lucide React, Vite  
> **Target Platform**: Responsive Web Application (Optimized for Desktop & Tablet)

---

## 1. Executive Summary & Product Vision

**EduSync** is an institutional-grade faculty portal designed for university professors, department heads, and course instructors (configured by default for **Dr. Debasis Bhattacharya**, Associate Professor & Course Lead in Computer Science & Engineering, Spring 2026).

The platform eliminates fragmented academic workflows by consolidating:
1. **Daily Lecture Timetables & Podium Telemetry**: Real-time class session monitoring, lecture progress bars, room hardware readiness (projector links, microphone resonance in dB, podium hotline).
2. **"Live Safe" RFID & Biometric Attendance**: Smart turnstile attendance sync, batch filtering (ME-102 Div B, ES-101 Div A/C, ES-101L), status modifiers (Present, Late, Absent, Excused), 5-session attendance streaks, and one-click batch reconciliation.
3. **Continuous Student Performance & Priority Intervention Watchlist**: Visual grade distribution curves, continuous assessment tracking, automated detection of students falling below attendance (<75%) or quiz thresholds (<60%), with one-click 1-on-1 remedial scheduling and advisor notification.
4. **Faculty Document Vault & Secure Paper Bank**: Course repository supporting drag-and-drop uploads and cryptographic dynamic watermarking for sensitive mid-term question papers.
5. **Academic Calendar & University Deadlines**: Spring 2026 week-by-week calendar tracking syllabus cutoffs, examination lock dates, senate meetings, and student events.
6. **Teacher Workspace & Leave Management**: Casual, Medical, and Academic Duty leave counters with proxy faculty delegation workflows and Dean Academic official circulars.
7. **AI Teacher Assistant**: Generative pedagogical tools for 50-minute structured lecture breakdowns, Bloom's taxonomy exam question synthesis with rubric grading schemes, and student doubt resolution.

---

## 2. Design System & Typographic Architecture

### 2.1 Color Palette
- Canvas Background: #faf8ff (Soft neutral canvas)
- Surface White: #ffffff (Elevated cards, tables, panels, modals)
- Primary Brand Indigo: #3525cd (Active states, key buttons, selected tabs)
- Primary Container: #dae2fd (Pills, badges, accent highlights)
- Text Primary: #131b2e (Headings, primary text)
- Text Secondary: #464555 (Secondary labels, room details)
- Text Muted: #777587 (Timestamps, roll numbers, shortcuts)
- Border Neutral: #eaedff (Card framing, container outlines)
- Success / Green: #006e4b (Present status, verified badges)
- Warning / Amber: #b25e00 (At-risk flags, late arrivals)
- Alert / Crimson: #ba1a1a (Unresolved doubts, absent marks)

### 2.2 Typography
- Headings: font-['Sora']
- Body: font-['Inter']
- Monospace / Timestamps / Codes: font-['JetBrains_Mono']

---

## 3. Data Schema & Core Interfaces

- LectureSlot (id, timeStart, timeEnd, courseCode, courseTitle, division, studentsCount, room, status, elapsed, actionType)
- Student (id, rollNo, name, avatar, status, punchTime, streak, batch, quizScore, midTermReadiness, doubtsCount, isAtRisk)
- StickyNote (id, tag, tagBg, tagText, dueText, content, completed, category)
- LeaveRequest (id, type, fromDate, toDate, days, reason, proxyFaculty, status, submittedDate)
- CourseDocument (id, title, courseCode, category, fileSize, uploadedAt, status, downloads)
- FlaggedDoubt (id, studentName, rollNo, courseCode, topic, question, submittedTime, resolved, priority)
- CalendarEvent (id, title, date, time, type, courseCode, room)

---

## 4. Antigravity Prompt (Copy-Paste Ready)

You are an expert full-stack React and UI engineer. Build "EduSync", a comprehensive university faculty portal and lecture management system for Dr. Debasis Bhattacharya (Associate Professor, Spring 2026).

Include the 7 primary screens:
1. "daily-schedule": Lecture cards (completed ES-101, active in-session ME-102 with progress bar, upcoming lab), Smart Podium telemetry (projector, 52 dB mic meter, hotline ext. 209), and interactive sticky notes.
2. "student-attendance": Live Safe RFID attendance console with batch tabs (ME-102 Div B, ES-101 Div A/C, ES-101L), student table with statuses (P/L/A/E), punch timestamps, 5-day streak blocks, and Mark All Present.
3. "student-performance": Grade distribution curves, continuous assessment metrics, Priority Intervention Watchlist for students <75% attendance or <60% quiz, and 1-on-1 remedial office hour scheduling modal.
4. "upload-documents": Faculty document vault with drag-and-drop uploader and cryptographic dynamic watermarking for confidential mid-term question papers.
5. "academic-calendar": Spring 2026 Month/Week grid, exam deadlines, question paper lock dates, and day agenda viewer.
6. "teacher-workspace-and-leaves": Casual/Medical/Duty leave quotas, an "Apply for Leave" modal with proxy faculty assignment, and Dean Academic official circulars.
7. "ai-teacher-assistant": 50-minute structured lesson plan architect, Bloom's taxonomy exam question creator with marking rubrics, and student doubt auto-resolver.
`;
