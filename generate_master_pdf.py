import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress header and footer on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#dc2626"))
        
        # Header Top Bar
        self.drawString(54, 11 * 72 - 36, "ADAPTIVELEARN PLATFORM")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(170, 11 * 72 - 36, "|   End-to-End Architectural Blueprint & Code Workflows")
        
        # Top Rule Line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Footer Bottom Bar
        self.line(54, 45, 8.5 * 72 - 54, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 32, "Confidential & Proprietary  •  Architectural Engineering Documentation")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 32, page_str)
        self.restoreState()


def build_pdf(filename="AdaptiveLearn_Master_Architecture_Blueprint.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#dc2626")      # Enterprise Crimson
    c_obsidian = colors.HexColor("#0f172a")     # Deep Obsidian Black
    c_slate_dark = colors.HexColor("#1e293b")   # Slate 800
    c_slate_text = colors.HexColor("#334155")   # Slate 700
    c_slate_muted = colors.HexColor("#64748b")  # Slate 500
    c_bone = colors.HexColor("#f8fafc")         # Light Bone Background
    c_border = colors.HexColor("#e2e8f0")       # Border hairline
    c_code_bg = colors.HexColor("#0f172a")      # Dark Editor Code Background
    c_code_text = colors.HexColor("#f1f5f9")    # Light Code text
    c_callout_bg = colors.HexColor("#fef2f2")   # Light Crimson Callout
    c_emerald = colors.HexColor("#059669")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=c_obsidian,
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceAfter=15
    )
    tagline_style = ParagraphStyle(
        'CoverTagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=c_slate_text,
        spaceAfter=25
    )
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_obsidian,
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_obsidian,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=c_slate_text,
        spaceAfter=6
    )
    analogy_style = ParagraphStyle(
        'AnalogyText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#7f1d1d")
    )
    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=c_code_text
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_slate_text
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    def make_callout(text, prefix="💡 REAL-WORLD ANALOGY:"):
        p_text = f"<b>{prefix}</b> {text}"
        p = Paragraph(p_text, analogy_style)
        t = Table([[p]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_callout_bg),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fca5a5")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        return t

    def make_code_box(code_str, language="JAVA / PYTHON / JS"):
        header_p = Paragraph(f"<b>TERMINAL / CODE VIEW:</b> {language}", ParagraphStyle('CodeH', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#94a3b8")))
        content_p = Paragraph(code_str.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)
        t = Table([[header_p], [content_p]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_code_bg),
            ('BOX', (0,0), (-1,-1), 1, c_slate_dark),
            ('PADDING', (0,0), (-1,0), 6),
            ('PADDING', (0,1), (-1,1), 8),
            ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#334155")),
        ]))
        return t

    def make_flowchart_box(steps):
        flow_rows = []
        for idx, (role, desc) in enumerate(steps, 1):
            cell_p = Paragraph(f"<b>Step {idx} [{role}]:</b> {desc}", body_style)
            flow_rows.append([cell_p])
        t = Table(flow_rows, colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bone),
            ('BOX', (0,0), (-1,-1), 1, c_border),
            ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        return t

    # -------------------------------------------------------------------------
    # COVER PAGE / TITLE
    # -------------------------------------------------------------------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("ADAPTIVELEARN PLATFORM", subtitle_style))
    story.append(Paragraph("The Master Architecture Blueprint", title_style))
    story.append(Paragraph("Complete End-to-End System Architecture, Microservice Dataflows & Code Implementations", tagline_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceAfter=15))

    # Executive Overview Metadata Card
    meta_data = [
        [Paragraph("<b>System Type:</b>", body_style), Paragraph("3-Tier AI-Powered Adaptive Education Engine", body_style), Paragraph("<b>Target LLM:</b>", body_style), Paragraph("Google Gemini 2.5 / 1.5 Flash (GenAI SDK)", body_style)],
        [Paragraph("<b>Frontend:</b>", body_style), Paragraph("React 18 + Vite + Tailwind CSS", body_style), Paragraph("<b>Backend:</b>", body_style), Paragraph("Spring Boot 3 (Java 21) + Hibernate + MySQL/H2", body_style)],
        [Paragraph("<b>AI Microservice:</b>", body_style), Paragraph("FastAPI (Python 3.11) + Pydantic v2", body_style), Paragraph("<b>ML Telemetry:</b>", body_style), Paragraph("Scikit-Learn (RandomForestClassifier)", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[80, 172, 80, 172])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bone),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Executive Summary Paragraph
    story.append(Paragraph("<b>1. Executive Architectural Summary</b>", h1_style))
    story.append(Paragraph(
        "AdaptiveLearn is an enterprise-grade AI education platform engineered to transform arbitrary career objectives "
        "(e.g., <i>'Java Backend Developer with Spring Boot'</i>, <i>'AWS Cloud DevOps'</i>, or <i>'IELTS Preparation'</i>) "
        "into structured, milestone-based learning roadmaps. The system features real-time <b>Socratic mentoring</b>, "
        "<b>automated remediation loops</b> that dynamically heal knowledge gaps when assessment scores drop below 70%, "
        "and <b>machine learning telemetry</b> that predicts student dropout risks in real-time.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Visual Architecture ASCII Diagram Table
    arch_diagram_text = (
        "+-------------------------------------------------------------------------------------------+<br/>"
        "|                                     SYSTEM TOPOLOGY                                       |<br/>"
        "+-------------------------------------------------------------------------------------------+<br/>"
        "  [ 💻 USER BROWSER ]<br/>"
        "          │  HTTP/JSON + JWT Bearer Auth (Port 5173)<br/>"
        "          ▼<br/>"
        "  ┌────────────────────────────────────────────────────────┐<br/>"
        "  │  TIER 1: FRONTEND (React 18 + Vite + Tailwind CSS)     │<br/>"
        "  └────────────────────────────────────────────────────────┘<br/>"
        "          │  REST APIs (/api/auth, /api/courses, /api/tutor, /api/assessments)<br/>"
        "          ▼<br/>"
        "  ┌────────────────────────────────────────────────────────┐<br/>"
        "  │  TIER 2: BACKEND ORCHESTRATOR (Spring Boot 3, Java 21) │ (Port 8085)<br/>"
        "  │  • Spring Security (JWT Tokens) & BCrypt Hashing       │<br/>"
        "  │  • Spring Data JPA (Hibernate ORM) & MySQL/H2 Database │<br/>"
        "  │  • Automated Remediation Trigger Logic                 │<br/>"
        "  └────────────────────────────────────────────────────────┘<br/>"
        "          │  Internal Synchronous HTTP (Spring RestClient to Port 8000)<br/>"
        "          ▼<br/>"
        "  ┌────────────────────────────────────────────────────────┐<br/>"
        "  │  TIER 3: AI MICROSERVICE (FastAPI, Python 3.11)        │ (Port 8000)<br/>"
        "  │  • Pydantic v2 Strict JSON Schema Validation           │<br/>"
        "  │  • Scikit-Learn Predictive Dropout Classifier          │<br/>"
        "  │  • Google GenAI SDK (Gemini 2.5 Flash Adapter)         │<br/>"
        "  └────────────────────────────────────────────────────────┘<br/>"
        "          │  HTTPS API Call (Google Cloud)<br/>"
        "          ▼<br/>"
        "  ┌────────────────────────────────────────────────────────┐<br/>"
        "  │  TIER 4: FOUNDATION MODEL (Google Gemini LLM Cloud)    │<br/>"
        "  └────────────────────────────────────────────────────────┘"
    )
    story.append(make_code_box(arch_diagram_text, "TOPOLOGY DIAGRAM"))
    story.append(Spacer(1, 10))

    # Why Separate Spring Boot and FastAPI Table
    story.append(Paragraph("<b>Why Separate Spring Boot and FastAPI? (Design Justification)</b>", h2_style))
    reasons_data = [
        [Paragraph("Domain / Concern", table_header), Paragraph("Technology Choice", table_header), Paragraph("Technical Justification", table_header)],
        [Paragraph("Security & Identity", table_cell), Paragraph("Spring Boot (Java)", table_cell), Paragraph("Industry standard for bulletproof JWT security filters, BCrypt password hashing, and role-based route guards.", table_cell)],
        [Paragraph("Data Integrity & ACID", table_cell), Paragraph("Spring Data JPA / MySQL", table_cell), Paragraph("Manages complex relational entities (@OneToMany, @ManyToOne), cascade operations, and transactional database integrity.", table_cell)],
        [Paragraph("AI & LLM Orchestration", table_cell), Paragraph("FastAPI (Python)", table_cell), Paragraph("Native runtime for Google GenAI SDK, Pydantic strict schemas, numpy, and asynchronous generative model streaming.", table_cell)],
        [Paragraph("Machine Learning", table_cell), Paragraph("Scikit-Learn (Python)", table_cell), Paragraph("Trains and runs real-time RandomForestClassifier pipeline on student behavioral telemetry.", table_cell)],
    ]
    reasons_table = Table(reasons_data, colWidths=[110, 114, 280])
    reasons_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_obsidian),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bone]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(reasons_table)

    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # FEATURE 1: AUTHENTICATION & JWT SECURITY
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>2. Feature 1: User Authentication & JWT Security Workflow</b>", h1_style))
    story.append(make_callout("Think of an airport security passport check. You show your passport once at the check-in desk (Registration/Login). The airline issues you a digitally signed boarding pass (JWT Token). For every gate you board afterwards (accessing courses or AI tutor), you show your boarding pass. Security verifies the signature in milliseconds without re-querying the passport database."))
    story.append(Spacer(1, 8))

    auth_steps = [
        ("React UI (Login.jsx)", "User inputs email/password -> Axios dispatches HTTP POST /api/auth/login to Spring Boot."),
        ("Spring Boot (AuthController)", "Authenticates credentials with AuthenticationManager -> Verifies BCrypt hashed password against database."),
        ("Spring Boot (JwtUtils)", "Generates cryptographically signed JWT token embedding student email and ROLE_STUDENT claims."),
        ("React (AuthContext.jsx)", "Saves JWT in localStorage -> Configures Axios Request Interceptor to inject 'Authorization: Bearer <token>' on all future requests."),
        ("Spring Boot (Security Filter)", "JwtAuthenticationFilter intercepts incoming requests -> Validates signature -> Sets SecurityContextHolder authentication.")
    ]
    story.append(make_flowchart_box(auth_steps))
    story.append(Spacer(1, 8))

    auth_code = (
        "// 1. Spring Boot Controller: Authenticating and Generating JWT\n"
        "@PostMapping(\"/login\")\n"
        "public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {\n"
        "    Authentication auth = authManager.authenticate(\n"
        "        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())\n"
        "    );\n"
        "    String token = jwtUtils.generateToken(request.getEmail());\n"
        "    User user = userRepository.findByEmail(request.getEmail()).orElseThrow();\n"
        "    return ResponseEntity.ok(new AuthDTO.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName()));\n"
        "}\n\n"
        "// 2. React Axios Interceptor: Automatically attaching Token\n"
        "api.interceptors.request.use((config) => {\n"
        "    const token = localStorage.getItem('token');\n"
        "    if (token) config.headers.Authorization = `Bearer ${token}`;\n"
        "    return config;\n"
        "});"
    )
    story.append(make_code_box(auth_code, "AUTHENTICATION & TOKEN INTERCEPTOR"))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------------------
    # FEATURE 2: ONBOARDING & DIAGNOSTIC PRE-ASSESSMENT
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>3. Feature 2: Onboarding & Baseline Diagnostic Pre-Assessment</b>", h1_style))
    story.append(make_callout("Think of a personal fitness trainer. Before creating a customized workout routine, the trainer tests your baseline strength on 3 exercises to determine what you already know. This avoids wasting time teaching you beginner basics if you already possess intermediate competencies."))
    story.append(Spacer(1, 8))

    diag_steps = [
        ("React (OnboardingWizard)", "Collects student goal, stated experience level, available hours per week, and preferred learning style."),
        ("Spring Boot (/student/onboarding)", "Persists preferences -> Invokes FastAPI /ai/generate-diagnostic-assessment via AiServiceClient."),
        ("FastAPI & Gemini LLM", "Fills DIAGNOSTIC_ASSESSMENT_PROMPT -> Generates 3-5 multi-topic MCQs calibrated to the student's target goal."),
        ("React (DiagnosticQuiz.jsx)", "Presents interactive testing environment -> Evaluates individual topic scores (e.g. OOP: 100%, SQL: 33%)."),
        ("Course Generator (/courses/generate)", "Transmits topic scores to synthesis engine -> Builds curriculum that skips mastered concepts.")
    ]
    story.append(make_flowchart_box(diag_steps))
    story.append(Spacer(1, 8))

    diag_code = (
        "# FastAPI: Generating Structured Diagnostic Questions via Gemini\n"
        "@app.post(\"/ai/generate-diagnostic-assessment\", response_model=DiagnosticAssessmentResponse)\n"
        "async def generate_diagnostic_assessment(req: DiagnosticAssessmentRequest):\n"
        "    prompt = DIAGNOSTIC_ASSESSMENT_PROMPT.format(\n"
        "        goal=req.goal,\n"
        "        experience_level=req.experience_level\n"
        "    )\n"
        "    # Enforces strict Pydantic schema validation on LLM JSON output\n"
        "    return await llm_adapter.generate_structured(prompt, DiagnosticAssessmentResponse)"
    )
    story.append(make_code_box(diag_code, "FASTAPI DIAGNOSTIC ENDPOINT"))

    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # FEATURE 3: ROADMAP SYNTHESIS, AI RE-TUNING & GOAL PIVOT
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>4. Feature 3: Course Roadmap Synthesis, AI Re-Tuning & Goal Pivot</b>", h1_style))
    story.append(make_callout("Think of a GPS navigation system. It calculates the fastest multi-stop route to your destination. If you hit a roadblock or decide midway to change your destination from 'Chicago' to 'New York', the GPS preserves all the miles you've already driven and recalculates only the road ahead."))
    story.append(Spacer(1, 8))

    roadmap_steps = [
        ("Student Goal Input", "Student enters objective: 'Java Backend Developer with Spring Boot & Microservices'."),
        ("Spring Boot -> FastAPI Call", "LearningPathService calls FastAPI /ai/create-course-roadmap via Spring RestClient HTTP POST."),
        ("FastAPI -> Gemini Generation", "Gemini decomposes the objective into 4-6 sequential milestone modules with estimated durations and difficulty."),
        ("Database Persistence (JPA)", "Spring Boot saves LearningPath entity and cascades LearningPathItem entities (Module 1 UNLOCKED, others LOCKED)."),
        ("Mid-Track Goal Pivot (/adapt-goal)", "If student changes goal, completed modules are preserved; uncompleted modules are dynamically regenerated by AI.")
    ]
    story.append(make_flowchart_box(roadmap_steps))
    story.append(Spacer(1, 8))

    roadmap_code = (
        "// Spring Boot: LearningPathService.java - Persisting Course & Modules\n"
        "@Transactional\n"
        "public LearningPath createCourseRoadmap(String email, Map<String, Object> request) {\n"
        "    StudentProfile profile = profileRepository.findByUserEmail(email).orElseThrow();\n"
        "    Map<String, Object> aiResponse = aiServiceClient.createCourseRoadmap(request);\n"
        "    List<Map<String, Object>> modules = (List<Map<String, Object>>) aiResponse.get(\"modules\");\n\n"
        "    LearningPath path = pathRepository.save(new LearningPath(profile, (String) aiResponse.get(\"course_title\"), modules.size()));\n"
        "    int seq = 1;\n"
        "    for (Map<String, Object> m : modules) {\n"
        "        LearningPathItem.ItemStatus status = (seq == 1) ? ItemStatus.UNLOCKED : ItemStatus.LOCKED;\n"
        "        pathItemRepository.save(new LearningPathItem(path, (String)m.get(\"title\"), (String)m.get(\"topic_name\"),\n"
        "                                                     (String)m.get(\"description\"), seq, DifficultyLevel.BEGINNER, 60, status));\n"
        "        seq++;\n"
        "    }\n"
        "    return path;\n"
        "}"
    )
    story.append(make_code_box(roadmap_code, "SPRING BOOT ROADMAP SYNTHESIS"))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------------------
    # FEATURE 4: DEEP LESSON NOTES & VIDEO CURATIONS
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>5. Feature 4: Deep Interactive Lesson Notes & Video Curations</b>", h1_style))
    story.append(make_callout("Think of an intelligent digital textbook that writes itself on-demand. When you open a chapter for the first time, an expert professor writes comprehensive theory, provides working code examples, warns you of common mistakes, and attaches curated video lectures. The chapter is then cached in the library for instant 5ms loading on future visits."))
    story.append(Spacer(1, 8))

    lesson_code = (
        "// Spring Boot: Smart Database Caching for Lesson Content\n"
        "@Transactional\n"
        "public Map<String, Object> getOrGenerateLessonContent(Long itemId, String email) {\n"
        "    LearningPathItem item = pathItemRepository.findById(itemId).orElseThrow();\n\n"
        "    // 1. Return from DB cache if previously generated (5ms response time)\n"
        "    if (item.getLessonContentJson() != null && !item.getLessonContentJson().isBlank()) {\n"
        "        return objectMapper.readValue(item.getLessonContentJson(), Map.class);\n"
        "    }\n\n"
        "    // 2. Cache miss: Request FastAPI /ai/generate-lesson-content\n"
        "    Map<String, Object> contentRes = aiServiceClient.generateLessonContent(Map.of(\n"
        "        \"topic_name\", item.getTopicName(), \"course_goal\", item.getLearningPath().getGoalText()\n"
        "    ));\n\n"
        "    // 3. Cache into Database and return\n"
        "    item.setLessonContentJson(objectMapper.writeValueAsString(contentRes));\n"
        "    pathItemRepository.save(item);\n"
        "    return contentRes;\n"
        "}"
    )
    story.append(make_code_box(lesson_code, "SMART LESSON CACHING PIPELINE"))

    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # FEATURE 5: SOCRATIC AI TUTOR & SANDBOX
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>6. Feature 5: Real-Time Socratic AI Tutor & Workspace Sandbox</b>", h1_style))
    story.append(make_callout("Standard AI chatbots give you direct answers immediately, encouraging passive reading. A Socratic mentor acts like an Oxford tutor: it responds with thought-provoking questions, real-world mechanical analogies, and targeted hints that guide you to discover the fundamental architectural principles yourself."))
    story.append(Spacer(1, 8))

    tutor_code = (
        "# FastAPI: main.py - Context-Aware Socratic AI Tutor Prompt\n"
        "@app.post(\"/ai/chat\", response_model=ChatResponse)\n"
        "async def chat_with_tutor(req: ChatRequest):\n"
        "    system_instruction = f\"\"\"\n"
        "    You are an expert Socratic AI Tutor for the topic: '{req.topic_name}'.\n"
        "    Student Level: {req.current_level} | Known Weaknesses: {req.weak_skills}\n"
        "    Pedagogy Rules:\n"
        "    1. Guide the student using relatable real-world physical analogies and mental models.\n"
        "    2. Never give raw unguided answers; prompt interactive active-recall questions.\n"
        "    3. When code is requested, provide clean syntax-highlighted examples with explanations.\n"
        "    \"\"\"\n"
        "    reply = await llm_adapter.generate_chat_text(system_instruction, req.message, req.conversation_history)\n"
        "    return ChatResponse(reply=reply, suggested_followups=[\n"
        "        f\"Explain {req.topic_name} with another analogy\", \"Give me a 1-minute conceptual challenge!\"\n"
        "    ])"
    )
    story.append(make_code_box(tutor_code, "FASTAPI SOCRATIC MENTORING ENGINE"))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------------------
    # FEATURE 6: MULTI-MODAL ASSESSMENT & REMEDIATION LOOP
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>7. Feature 6: Multi-Modal Assessment & Automated Remediation Loop (< 70%)</b>", h1_style))
    story.append(make_callout("In traditional learning, when a student fails a test, they are told to 'try again' with no assistance. In AdaptiveLearn, if your score drops below 70%, the system activates a self-healing loop: AI analyzes your exact mistakes, creates a custom 'Remedial Mastery Lab' module, and automatically inserts it into your active roadmap to reinforce prerequisites."))
    story.append(Spacer(1, 8))

    remedial_steps = [
        ("Student Submits Test", "Submits MCQs, Conceptual Descriptive Essay, and Sandbox Code to POST /api/assessments/{id}/submit."),
        ("Rubric Grading Engine", "Spring Boot grades MCQs & invokes FastAPI /ai/evaluate-descriptive for LLM rubric evaluation."),
        ("Branch A: Score >= 70%", "Module marked COMPLETED -> Next sequential module unlocked -> Skill Mastery Radar updated -> Confetti 🎉."),
        ("Branch B: Score < 70%", "Spring Boot triggers Remediation Loop -> Calls FastAPI /ai/generate-remedial-module with specific weaknesses."),
        ("Dynamic Roadmap Insertion", "Spring Boot shifts all subsequent modules by +1 in sequence order -> Inserts Remedial Lab -> Unlocks it immediately.")
    ]
    story.append(make_flowchart_box(remedial_steps))
    story.append(Spacer(1, 8))

    remedial_code = (
        "// Spring Boot: AssessmentService.java - Automated Remediation Trigger Logic\n"
        "if (percentage >= 70.0) {\n"
        "    learningPathService.completeItemAndUnlockNext(assessment.getPathItem().getId(), email);\n"
        "} else {\n"
        "    // AUTOMATED REMEDIATION SELF-HEALING LOOP\n"
        "    Map<String, Object> remedialData = aiServiceClient.generateRemedialModule(Map.of(\n"
        "        \"topic_name\", assessment.getPathItem().getTopicName(),\n"
        "        \"score_percentage\", percentage,\n"
        "        \"weaknesses\", extractedWeaknesses,\n"
        "        \"course_goal\", assessment.getPathItem().getLearningPath().getGoalText()\n"
        "    ));\n"
        "    // Dynamically inserts module into student's roadmap tree\n"
        "    learningPathService.insertRemedialItem(path.getId(), assessment.getPathItem(), remedialData);\n"
        "}"
    )
    story.append(make_code_box(remedial_code, "AUTOMATED REMEDIATION LOOP"))

    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # FEATURE 7: SCIKIT-LEARN DROPOUT RISK TELEMETRY
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>8. Feature 7: Scikit-Learn Predictive Dropout Risk & Skill Matrix</b>", h1_style))
    story.append(make_callout("Think of an airplane cockpit flight recorder (black box). It continuously analyzes speed, altitude, weather turbulence, and pitch. If it detects conditions that lead to stalls, it issues early warnings to the pilot. Our Scikit-Learn ML classifier monitors study velocity, missed quizzes, and inactivity to intervene before a student gives up."))
    story.append(Spacer(1, 8))

    ml_factors = [
        ("Completion Pace Rate", "Proportion of total course milestones completed versus expected timeline (0.0 to 1.0)."),
        ("Assessment Average", "Cumulative score average across all objective, descriptive, and sandbox assessments."),
        ("Inactivity Duration", "Number of days elapsed since the student's last active learning session."),
        ("Missed Checkpoints", "Number of skipped or failed milestone verification tests."),
        ("Performance Trend Slope", "Mathematical gradient slope of recent quiz scores (positive growth vs. negative decline).")
    ]
    story.append(make_flowchart_box(ml_factors))
    story.append(Spacer(1, 8))

    ml_code = (
        "# FastAPI: main.py - Scikit-Learn RandomForest Predictive Pipeline\n"
        "class LearningRiskPredictor:\n"
        "    def __init__(self):\n"
        "        self.pipeline = Pipeline([\n"
        "            ('scaler', StandardScaler()),\n"
        "            ('rf', RandomForestClassifier(n_estimators=50, random_state=42))\n"
        "        ])\n"
        "        self.pipeline.fit(X_train, y_train)\n\n"
        "    def predict(self, completion_rate, avg_score, days_inactive, missed_count, trend_slope):\n"
        "        features = np.array([[completion_rate, avg_score, days_inactive, missed_count, trend_slope]])\n"
        "        pred_class = self.pipeline.predict(features)[0]  # 0=LOW, 1=MEDIUM, 2=HIGH\n"
        "        proba = self.pipeline.predict_proba(features)[0]\n"
        "        risk_score = float(proba[1]*0.5 + proba[2]*1.0)\n"
        "        risk_level = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}.get(pred_class, 'LOW')\n"
        "        return risk_level, risk_score, self._calculate_factors(features)"
    )
    story.append(make_code_box(ml_code, "SCIKIT-LEARN RISK CLASSIFIER"))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------------------
    # SUMMARY & ARCHITECTURAL HIGHLIGHTS TABLE
    # -------------------------------------------------------------------------
    story.append(Paragraph("<b>9. Architectural Summary Matrix</b>", h1_style))
    summary_data = [
        [Paragraph("Feature Area", table_header), Paragraph("Frontend UI (React)", table_header), Paragraph("Backend Logic (Spring Boot)", table_header), Paragraph("AI & ML Microservice (FastAPI)", table_header)],
        [Paragraph("1. Authentication", table_cell), Paragraph("JWT in localStorage & Axios Interceptor", table_cell), Paragraph("Spring Security + BCrypt + JwtUtils", table_cell), Paragraph("N/A (Decoupled Auth)", table_cell)],
        [Paragraph("2. Baseline Quiz", table_cell), Paragraph("DiagnosticQuiz.jsx with Topic Meters", table_cell), Paragraph("Persists Onboarding Preferences", table_cell), Paragraph("Gemini Dynamic MCQ Generator", table_cell)],
        [Paragraph("3. Roadmap Tree", table_cell), Paragraph("CourseRoadmap.jsx (Progression Tree)", table_cell), Paragraph("LearningPath & Items State Machine", table_cell), Paragraph("Gemini Curriculum Decomposer", table_cell)],
        [Paragraph("4. Lesson Notes", table_cell), Paragraph("LessonViewer.jsx + Dark Code Box", table_cell), Paragraph("Smart DB JSON Caching (5ms load)", table_cell), Paragraph("Markdown + YouTube Curator", table_cell)],
        [Paragraph("5. Socratic Tutor", table_cell), Paragraph("ChatWorkspace.jsx + Code Sandbox", table_cell), Paragraph("Conversation Session Orchestrator", table_cell), Paragraph("Context-Aware Analogy Prompt Engine", table_cell)],
        [Paragraph("6. Remediation", table_cell), Paragraph("AssessmentRunner.jsx + Remedial Alert", table_cell), Paragraph("Auto-inserts Remedial Module (<70%)", table_cell), Paragraph("Synthesizes Targeted Practice Lab", table_cell)],
        [Paragraph("7. ML Telemetry", table_cell), Paragraph("StudentProfile.jsx (Proficiency Radar)", table_cell), Paragraph("Aggregates Velocity & Test Metrics", table_cell), Paragraph("Scikit-Learn RandomForest Pipeline", table_cell)],
    ]
    summary_table = Table(summary_data, colWidths=[80, 140, 140, 144])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_obsidian),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bone]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(summary_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "AdaptiveLearn_Master_Architecture_Blueprint.pdf"
    build_pdf(out_file)
