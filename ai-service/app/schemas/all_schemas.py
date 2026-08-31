from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# 1. Chat Schemas
class ChatRequest(BaseModel):
    student_id: int
    topic_name: Optional[str] = "General"
    current_level: Optional[str] = "BEGINNER"
    learning_style: Optional[str] = "hands-on with analogies"
    weak_skills: Optional[List[str]] = []
    recent_mistakes: Optional[List[str]] = []
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    reply: str
    suggested_followups: Optional[List[str]] = []

class RemedialModuleRequest(BaseModel):
    student_id: int
    topic_name: str
    score_percentage: float
    weaknesses: List[str] = []
    course_goal: Optional[str] = "Course Mastery"
    sequence_order: Optional[int] = 1

# 2. Dynamic Lesson Content Generation Schemas
class LessonContentRequest(BaseModel):
    topic_name: str
    course_goal: str
    difficulty_level: str
    learning_style: Optional[str] = "hands-on with analogies"

class VideoResource(BaseModel):
    title: str
    channel_name: str
    search_query: str
    description: str

class LessonContentResponse(BaseModel):
    topic_name: str
    overview: str
    core_concepts_markdown: str
    practical_examples_markdown: str
    common_pitfalls_markdown: str
    key_takeaways: List[str]
    recommended_video_resources: List[VideoResource]

# 3. Learning Plan Schemas
class CreateCourseRoadmapRequest(BaseModel):
    student_id: int
    goal: str
    experience_level: str  # BEGINNER, INTERMEDIATE, ADVANCED
    weekly_hours: Optional[int] = 8
    learning_style: Optional[str] = "hands-on with analogies"

class DiagnosticAssessmentRequest(BaseModel):
    student_id: Optional[int] = 1
    goal: str
    experience_level: Optional[str] = "BEGINNER"
    weekly_hours: Optional[int] = 8

class DiagnosticQuestion(BaseModel):
    id: int
    topic: str
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str

class DiagnosticAssessmentResponse(BaseModel):
    goal: str
    topics_covered: List[str]
    questions: List[DiagnosticQuestion]

class RoadmapModuleSchema(BaseModel):
    title: str
    topic_name: str
    description: str
    sequence_order: int
    difficulty_level: str
    estimated_minutes: int
    key_subtopics: List[str] = []

class CourseRoadmapResponse(BaseModel):
    course_title: str
    category: str
    summary: str
    estimated_total_weeks: int
    modules: List[RoadmapModuleSchema]

class ModifyRoadmapRequest(BaseModel):
    current_goal: str
    modification_intent: str
    existing_modules: List[RoadmapModuleSchema] = []

class AdaptGoalRoadmapRequest(BaseModel):
    student_id: Optional[int] = 1
    previous_goal: str
    new_goal: str
    completed_modules: List[str] = []
    experience_level: Optional[str] = "INTERMEDIATE"
    weekly_hours: Optional[int] = 8
    learning_style: Optional[str] = "hands-on with analogies"

# 4. Customizable Assessment Generation Schemas
class CustomAssessmentRequest(BaseModel):
    topic_name: str
    course_goal: str
    difficulty_level: str  # EASY, MEDIUM, HARD
    mcq_count: int = 3
    include_descriptive: bool = True
    include_coding: bool = False

class MCQQuestion(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str
    points: int = 1

class DescriptiveQuestion(BaseModel):
    question_text: str
    sample_answer: str
    evaluation_rubric: str
    points: int = 5

class CodingTestCase(BaseModel):
    input_data: str
    expected_output: str
    is_hidden: bool = False

class CodingQuestion(BaseModel):
    title: str
    problem_statement: str
    constraints: str
    starter_code: str
    test_cases: List[CodingTestCase]
    points: int = 10

class CustomAssessmentResponse(BaseModel):
    topic_name: str
    title: str
    mcqs: List[MCQQuestion] = []
    descriptive: Optional[DescriptiveQuestion] = None
    coding: Optional[CodingQuestion] = None

# 5. Descriptive Answer Evaluation
class DescriptiveEvalRequest(BaseModel):
    question_text: str
    student_answer: str
    sample_answer: str
    evaluation_rubric: str
    max_points: int = 5

class DescriptiveEvalResponse(BaseModel):
    score_awarded: float
    is_acceptable: bool
    strengths: List[str]
    missing_concepts: List[str]
    feedback: str

# 6. Recommendation Schemas
class RecommendationRequest(BaseModel):
    student_id: int
    current_goal: str
    completed_topics: List[str] = []
    weak_topics: List[str] = []
    last_assessment_score: Optional[float] = None

class RecommendationResponse(BaseModel):
    recommendation_type: str
    title: str
    reason: str
    suggested_action: str

# 7. Risk Prediction Schemas
class RiskPredictionRequest(BaseModel):
    student_id: int
    completion_rate: float
    average_assessment_score: float
    score_trend_slope: float
    days_since_last_active: int
    missed_assessments_count: int

class RiskPredictionResponse(BaseModel):
    student_id: int
    risk_level: str
    risk_score: float
    factors: List[str]
    intervention_recommendation: str
