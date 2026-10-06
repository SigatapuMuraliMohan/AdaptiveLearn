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
# Advanced AI / ML & Psychometric Engines
# -------------------------------------------------------------------------
from app.ml.risk_engine import risk_predictor
from app.ml.bkt_engine import bkt_engine
from app.ml.cat_engine import cat_engine
from app.rag.vector_store import rag_store

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "provider": settings.LLM_PROVIDER,
        "model": settings.GEMINI_MODEL,
        "ml_capabilities": [
            "Scikit-Learn Random Forest Dropout Risk + SHAP XAI",
            "Bayesian Knowledge Tracing (BKT) Latent Mastery Engine",
            "RAG Vector Store with Hybrid BM25 Search & Verified Citations",
            "2PL Computerized Adaptive Testing (CAT) via Item Response Theory"
        ]
    }

# 1. Structured Socratic AI Tutor Chat with Memory Context
@app.post("/ai/chat", response_model=ChatResponse)
async def chat_with_tutor(req: ChatRequest):
    try:
        rag_context, citations = rag_store.augment_prompt_with_citations(req.topic_name, req.message)
        system_instruction = STRUCTURED_TUTOR_PROMPT.format(
            topic_name=req.topic_name,
            current_level=req.current_level,
            learning_style=req.learning_style or "hands-on with analogies",
            weak_skills=req.weak_skills if req.weak_skills else ["None identified"],
            recent_mistakes=req.recent_mistakes if req.recent_mistakes else ["None recorded"]
        ) + rag_context

        reply = await llm_adapter.generate_chat_text(
            system_instruction=system_instruction,
            user_message=req.message,
            history=req.conversation_history
        )

        if citations:
            reply = reply + f"\n\n> 📚 **Verified Technical Source**: *{citations[0]}*"

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

# 9. Predictive Risk Model (Real Scikit-Learn Pipeline with SHAP Explainability)
@app.post("/ai/predict-risk", response_model=RiskPredictionResponse)
async def predict_learning_risk(req: RiskPredictionRequest):
    try:
        # Map telemetry to new 6-feature ML pipeline
        telemetry = {
            "avg_assessment_score": req.average_assessment_score,
            "quiz_retry_ratio": max(1.0, 1.0 + float(req.missed_assessments_count) * 0.5),
            "time_spent_per_lesson": 1.0,
            "hint_request_frequency": 2.0,
            "inactivity_days": float(req.days_since_last_active),
            "score_trend_slope": req.score_trend_slope
        }
        res = risk_predictor.predict_risk(telemetry)
        factor_strings = [f"{f['factor']} ({f['impact']}): {f['detail']}" for f in res["top_contributing_factors"]]

        return RiskPredictionResponse(
            student_id=req.student_id,
            risk_level=res["risk_level"],
            risk_score=res["risk_probability"],
            factors=factor_strings,
            intervention_recommendation=res["recommended_action"]
        )
    except Exception as e:
        logger.error(f"Risk prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------------------
# New Dedicated Advanced Endpoints: ML Risk, BKT, RAG, and CAT
# -------------------------------------------------------------------------

@app.post("/api/v1/ml/predict-risk")
async def ml_predict_risk(data: dict):
    """Predicts student dropout probability with Scikit-Learn Random Forest and SHAP attribution."""
    try:
        return risk_predictor.predict_risk(data)
    except Exception as e:
        logger.error(f"Predict risk error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/bkt/update")
async def bkt_update(data: dict):
    """Updates Bayesian Knowledge Tracing latent concept mastery P(L_t) after a quiz response."""
    try:
        current_p_l = float(data.get("current_p_l", 0.15))
        is_correct = bool(data.get("is_correct", False))
        custom_params = data.get("params", None)
        return bkt_engine.update_mastery(current_p_l, is_correct, custom_params)
    except Exception as e:
        logger.error(f"BKT update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/bkt/batch-trace")
async def bkt_batch_trace(data: dict):
    """Traces full progression trajectory of a multi-question quiz session."""
    try:
        responses = data.get("responses", [])
        initial_p_l = data.get("initial_p_l", None)
        return bkt_engine.trace_sequence(responses, initial_p_l)
    except Exception as e:
        logger.error(f"BKT trace error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/rag/search")
async def rag_search_verified_chunks(data: dict):
    """Retrieves verified technical documentation chunks using hybrid search."""
    try:
        query = data.get("query", "")
        top_k = int(data.get("top_k", 2))
        return {
            "query": query,
            "chunks": rag_store.search_verified_chunks(query, top_k)
        }
    except Exception as e:
        logger.error(f"RAG search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/cat/evaluate-response")
async def cat_evaluate_response(data: dict):
    """Computes updated student latent ability θ and standard error SE(θ) using 2PL IRT."""
    try:
        responses = data.get("responses", [])
        current_theta = float(data.get("current_theta", 0.0))
        return cat_engine.update_ability_estimate(responses, current_theta)
    except Exception as e:
        logger.error(f"CAT evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
