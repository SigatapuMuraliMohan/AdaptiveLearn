# AI-Powered Personalized Learning Platform

An AI-first, adaptive educational platform that understands an individual student's goals, baseline knowledge level, learning preferences, progress, and difficulties. It dynamically synthesizes custom learning pathways, teaches concepts conversationally via a Socratic AI Tutor, generates multi-format assessments (MCQ, descriptive, coding), performs multi-modal evaluation, and continuously adapts the curriculum.

---

## 🏛️ System Architecture

```
                             ┌───────────────────────────────┐
                             │       REACT FRONTEND          │
                             │   (Vite + Tailwind + Lucide)  │
                             │      http://localhost:5173    │
                             └───────────────┬───────────────┘
                                             │ HTTPS / REST (JWT Auth)
                                             ▼
                             ┌───────────────────────────────┐
                             │      SPRING BOOT BACKEND      │
                             │  (Auth, Business Logic, JPA)  │
                             │      http://localhost:8085    │
                             └───────┬───────────────┬───────┘
                                     │               │
                     JPA / Hibernate │               │ Internal HTTP (JSON)
                                     ▼               ▼
                        ┌────────────────┐  ┌─────────────────────────────────┐
                        │  MySQL 8.0 DB  │  │        FASTAPI AI SERVICE       │
                        │ localhost:3306 │  │ (LLM Orchestrator, Prompts, ML) │
                        └────────────────┘  │      http://localhost:8000      │
                                            └───────────────┬─────────────────┘
                                                            │
                                                            ▼
                                                   Google Gemini API
                                                   (gemini-2.5-flash)
```

---

## 🚀 Quick Start (1-Click Run)

Double-click `run_platform.bat` in `D:\ai-personalized-education\run_platform.bat`, or run each service in separate terminals:

### 1. Start FastAPI AI Service
```powershell
cd D:\ai-personalized-education\ai-service
.\venv\Scripts\python.exe main.py
```
*(Runs on http://localhost:8000)*

### 2. Start Spring Boot Backend
```powershell
cd D:\ai-personalized-education\backend
mvn spring-boot:run
```
*(Runs on http://localhost:8085)*

### 3. Start React Frontend
```powershell
cd D:\ai-personalized-education\frontend
npm run dev
```
*(Runs on http://localhost:5173)*

---

## 👤 Demo Login Credentials

* **Student Account:**
  * **Email:** `rahul@student.com`
  * **Password:** `admin123`
* **Admin Account:**
  * **Email:** `admin@platform.com`
  * **Password:** `admin123`

---

## 🔄 End-to-End Live Demonstration Flow

1. **Sign In:** Log in as `rahul@student.com` (or create a new account).
2. **Onboarding Wizard:** Choose goal (e.g. *Java Backend Developer*), weekly study hours, and learning style.
3. **AI Diagnostic Quiz:** Complete the 6-question baseline test. Watch the AI score topic strengths in real time.
4. **Dynamic Roadmap Generation:** Click *"Generate My Custom Learning Path"*. The AI synthesizes a personalized milestone roadmap saved to MySQL.
5. **Interactive Lesson & Socratic AI Tutor:** Open a milestone lesson. Chat with the contextual AI tutor on the side drawer for real-world analogies and code explanations.
6. **Multi-Modal Assessment:** Click *"Complete & Take Quiz"*. Submit MCQs and descriptive answers. The AI evaluates depth and returns strengths, conceptual gaps, and recommendations.
7. **Adaptive Progress & Mastery Radar:** View updated skill proficiencies, historical scores, and the ML difficulty risk index on your profile.
