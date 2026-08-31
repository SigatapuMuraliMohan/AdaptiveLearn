from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from app.core.config import settings
from app.core.llm_adapter import llm_adapter
from app.prompts.templates import (
    STRUCTURED_TUTOR_PROMPT,
    DIAGNOSTIC_ASSESSMENT_PROMPT,
    COURSE_ROADMAP_PROMPT,
    MODIFY_ROADMAP_PROMPT,
    ADAPT_GOAL_ROADMAP_PROMPT,
    REMEDIAL_MODULE_PROMPT,
    LESSON_CONTENT_PROMPT,
    CUSTOM_ASSESSMENT_PROMPT,
    DESCRIPTIVE_EVAL_PROMPT
)
from app.schemas.all_schemas import (
    ChatRequest, ChatResponse,
    DiagnosticAssessmentRequest, DiagnosticAssessmentResponse,
    CreateCourseRoadmapRequest, CourseRoadmapResponse,
    ModifyRoadmapRequest, AdaptGoalRoadmapRequest,
    RemedialModuleRequest, RoadmapModuleSchema,
    LessonContentRequest, LessonContentResponse,
    CustomAssessmentRequest, CustomAssessmentResponse,
    DescriptiveEvalRequest, DescriptiveEvalResponse,
    RecommendationRequest, RecommendationResponse,
    RiskPredictionRequest, RiskPredictionResponse
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Personalized Learning Platform - AI Microservice",
    description="FastAPI AI engine for dynamic curriculum generation, Socratic tutoring with memory context, scikit-learn predictive risk analytics, and multi-modal evaluations.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# Real Scikit-Learn Predictive Risk Model Pipeline
# -------------------------------------------------------------------------
class LearningRiskPredictor:
    def __init__(self):
        self.model = None
        self._train_initial_model()

    def _train_initial_model(self):
        # Synthetic dataset modeling educational telemetry:
        # Features: [completion_rate (0-1), average_score (0-100), days_inactive (0-30), missed_assessments (0-10), score_trend (-1 to 1)]
        # Target: 0 = LOW RISK, 1 = MEDIUM RISK, 2 = HIGH RISK
        np.random.seed(42)
        X = np.array([
            [0.85, 92.0, 0, 0, 0.2],   # 0: Low
            [0.90, 88.0, 1, 0, 0.1],   # 0: Low
            [0.75, 82.0, 2, 0, 0.05],  # 0: Low
            [0.80, 85.0, 1, 0, 0.15],  # 0: Low
            [0.55, 68.0, 3, 1, -0.05], # 1: Medium
            [0.60, 64.0, 4, 1, -0.1],  # 1: Medium
            [0.45, 70.0, 5, 1, 0.0],   # 1: Medium
            [0.50, 62.0, 4, 2, -0.15], # 1: Medium
            [0.20, 45.0, 8, 3, -0.3],  # 2: High
            [0.15, 50.0, 10, 4, -0.4], # 2: High
            [0.30, 40.0, 7, 2, -0.25], # 2: High
            [0.10, 35.0, 14, 5, -0.5], # 2: High
        ])
        y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])

        self.pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('rf', RandomForestClassifier(n_estimators=50, random_state=42))
        ])
        self.pipeline.fit(X, y)
        logger.info("Trained scikit-learn LearningRiskPredictor pipeline successfully.")

    def predict(self, completion_rate: float, avg_score: float, days_inactive: int, missed_count: int, trend_slope: float):
        features = np.array([[completion_rate, avg_score, days_inactive, missed_count, trend_slope]])
        pred_class = self.pipeline.predict(features)[0]
        proba = self.pipeline.predict_proba(features)[0]
        
        # Risk score corresponds to weighted probability of Medium (idx 1) + High (idx 2)
        risk_score = float(proba[1] * 0.5 + proba[2] * 1.0)
        
        risk_level_map = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
        risk_level = risk_level_map.get(pred_class, "LOW")

        factors = []
        if completion_rate < 0.4:
            factors.append(f"Low completion pace ({int(completion_rate * 100)}%)")
        if avg_score < 65:
            factors.append(f"Assessment score below benchmark ({round(avg_score, 1)}%)")
        if days_inactive >= 3:
            factors.append(f"Inactivity detected ({days_inactive} days since last session)")
        if missed_count > 0:
            factors.append(f"{missed_count} missed/unattempted quiz checkpoint(s)")
        if trend_slope < -0.1:
            factors.append("Declining performance trend across recent milestones")

        if not factors:
            factors.append("Steady learning velocity and strong mastery retention")

        return risk_level, round(risk_score, 2), factors

risk_predictor = LearningRiskPredictor()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "provider": settings.LLM_PROVIDER,
        "model": settings.GEMINI_MODEL,
        "ml_pipeline": "scikit-learn RandomForestClassifier"
    }

# 1. Structured Socratic AI Tutor Chat with Memory Context
@app.post("/ai/chat", response_model=ChatResponse)
async def chat_with_tutor(req: ChatRequest):
    try:
        system_instruction = STRUCTURED_TUTOR_PROMPT.format(
            topic_name=req.topic_name,
            current_level=req.current_level,
            learning_style=req.learning_style or "hands-on with analogies",
            weak_skills=req.weak_skills if req.weak_skills else ["None identified"],
            recent_mistakes=req.recent_mistakes if req.recent_mistakes else ["None recorded"]
        )
        reply = await llm_adapter.generate_chat_text(
            system_instruction=system_instruction,
            user_message=req.message,
            history=req.conversation_history
        )
        return ChatResponse(
            reply=reply,
            suggested_followups=[
                f"Can you explain {req.topic_name} with another real-world analogy?",
                f"What are the top 3 common pitfalls in {req.topic_name}?",
                "Give me a quick 1-minute conceptual challenge!"
            ]
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. Dynamic Diagnostic Pre-Assessment Generator
@app.post("/ai/generate-diagnostic-assessment", response_model=DiagnosticAssessmentResponse)
async def generate_diagnostic_assessment(req: DiagnosticAssessmentRequest):
    try:
        prompt = DIAGNOSTIC_ASSESSMENT_PROMPT.format(
            goal=req.goal,
            experience_level=req.experience_level
        )
        result = await llm_adapter.generate_structured(prompt, DiagnosticAssessmentResponse)
        return result
    except Exception as e:
        logger.error(f"Diagnostic generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Dynamic Course Roadmap Synthesis
@app.post("/ai/create-course-roadmap", response_model=CourseRoadmapResponse)
async def create_course_roadmap(req: CreateCourseRoadmapRequest):
    try:
        prompt = COURSE_ROADMAP_PROMPT.format(
            goal=req.goal,
            experience_level=req.experience_level,
            weekly_hours=req.weekly_hours,
            learning_style=req.learning_style
        )
        result = await llm_adapter.generate_structured(prompt, CourseRoadmapResponse)
        return result
    except Exception as e:
        logger.error(f"Course roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3b. Conversational Curriculum Re-tuning & Customization
@app.post("/ai/modify-roadmap", response_model=CourseRoadmapResponse)
async def modify_roadmap(req: ModifyRoadmapRequest):
    try:
        modules_json = [m.model_dump() for m in req.existing_modules]
        prompt = MODIFY_ROADMAP_PROMPT.format(
            current_goal=req.current_goal,
            modification_intent=req.modification_intent,
            existing_modules=modules_json
        )
        result = await llm_adapter.generate_structured(prompt, CourseRoadmapResponse)
        return result
    except Exception as e:
        logger.error(f"Modify roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3c. Dynamic Mid-Course Goal Adaptation (Preserves Completed Foundations)
@app.post("/ai/adapt-course-roadmap", response_model=CourseRoadmapResponse)
async def adapt_course_roadmap(req: AdaptGoalRoadmapRequest):
    try:
        prompt = ADAPT_GOAL_ROADMAP_PROMPT.format(
            previous_goal=req.previous_goal,
            new_goal=req.new_goal,
            completed_modules=req.completed_modules if req.completed_modules else ["Baseline Foundations"],
            experience_level=req.experience_level or "INTERMEDIATE",
            weekly_hours=req.weekly_hours or 8,
            learning_style=req.learning_style or "hands-on with analogies"
        )
        result = await llm_adapter.generate_structured(prompt, CourseRoadmapResponse)
        return result
    except Exception as e:
        logger.error(f"Adapt course roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4. Dynamic Remedial Module Generator (Triggered when test score < 70%)
@app.post("/ai/generate-remedial-module", response_model=RoadmapModuleSchema)
async def generate_remedial_module(req: RemedialModuleRequest):
    try:
        prompt = REMEDIAL_MODULE_PROMPT.format(
            topic_name=req.topic_name,
            score_percentage=req.score_percentage,
            weaknesses=", ".join(req.weaknesses) if req.weaknesses else "General core mechanics",
            course_goal=req.course_goal,
            sequence_order=req.sequence_order
        )
        result = await llm_adapter.generate_structured(prompt, RoadmapModuleSchema)
        return result
    except Exception as e:
        logger.error(f"Remedial module error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 5. Dynamic In-Depth Lesson Content with YouTube Video Resources
@app.post("/ai/generate-lesson-content", response_model=LessonContentResponse)
async def generate_lesson_content(req: LessonContentRequest):
    try:
        prompt = LESSON_CONTENT_PROMPT.format(
            topic_name=req.topic_name,
            course_goal=req.course_goal,
            difficulty_level=req.difficulty_level,
            learning_style=req.learning_style
        )
        result = await llm_adapter.generate_structured(prompt, LessonContentResponse)
        return result
    except Exception as e:
        logger.error(f"Lesson content error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 6. Customizable Assessment Generator
@app.post("/ai/generate-custom-assessment", response_model=CustomAssessmentResponse)
async def generate_custom_assessment(req: CustomAssessmentRequest):
    try:
        prompt = CUSTOM_ASSESSMENT_PROMPT.format(
            topic_name=req.topic_name,
            course_goal=req.course_goal,
            difficulty_level=req.difficulty_level,
            mcq_count=req.mcq_count,
            include_descriptive=req.include_descriptive,
            include_coding=req.include_coding
        )
        result = await llm_adapter.generate_structured(prompt, CustomAssessmentResponse)
        return result
    except Exception as e:
        logger.error(f"Assessment gen error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 7. Descriptive Answer Evaluation (Rubric-based)
@app.post("/ai/evaluate-descriptive", response_model=DescriptiveEvalResponse)
async def evaluate_descriptive_answer(req: DescriptiveEvalRequest):
    try:
        prompt = DESCRIPTIVE_EVAL_PROMPT.format(
            question_text=req.question_text,
            sample_answer=req.sample_answer,
            evaluation_rubric=req.evaluation_rubric,
            max_points=req.max_points,
            student_answer=req.student_answer
        )
        result = await llm_adapter.generate_structured(prompt, DescriptiveEvalResponse)
        return result
    except Exception as e:
        logger.error(f"Descriptive eval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 8. Intelligent Next-Action Recommendation
@app.post("/ai/recommend", response_model=RecommendationResponse)
async def get_recommendation(req: RecommendationRequest):
    try:
        if req.weak_topics and len(req.weak_topics) > 0:
            weakest = req.weak_topics[0]
            return RecommendationResponse(
                recommendation_type="REVISION",
                title=f"Strengthen Knowledge in {weakest}",
                reason=f"Your recent assessment indicated gaps in {weakest}.",
                suggested_action=f"Complete a 10-minute targeted review and practice lab on {weakest}."
            )
        elif req.last_assessment_score and req.last_assessment_score >= 80:
            return RecommendationResponse(
                recommendation_type="NEXT_LESSON",
                title="Advance to Next Milestone",
                reason=f"Excellent score ({req.last_assessment_score}%) on your recent assessment!",
                suggested_action="Unlock the next topic in your learning roadmap."
            )
        else:
            return RecommendationResponse(
                recommendation_type="PRACTICE_QUIZ",
                title="Consolidate Your Learning",
                reason="Regular practice reinforces long-term retention.",
                suggested_action="Try 3 quick practice questions to solidify key concepts."
            )
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 9. Predictive Risk Model (Real Scikit-Learn Pipeline)
@app.post("/ai/predict-risk", response_model=RiskPredictionResponse)
async def predict_learning_risk(req: RiskPredictionRequest):
    try:
        risk_level, risk_score, factors = risk_predictor.predict(
            completion_rate=req.completion_rate,
            avg_score=req.average_assessment_score,
            days_inactive=req.days_since_last_active,
            missed_count=req.missed_assessments_count,
            trend_slope=req.score_trend_slope
        )

        intervention = "Student is progressing smoothly."
        if risk_level == "HIGH":
            intervention = "High dropout risk detected. Recommend adaptive path simplification, targeted remedial drills, and scheduled mentor check-ins."
        elif risk_level == "MEDIUM":
            intervention = "Moderate risk. Offer extra analogies, progressive hints, and a recap session before the next milestone."

        return RiskPredictionResponse(
            student_id=req.student_id,
            risk_level=risk_level,
            risk_score=risk_score,
            factors=factors,
            intervention_recommendation=intervention
        )
    except Exception as e:
        logger.error(f"Risk prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
