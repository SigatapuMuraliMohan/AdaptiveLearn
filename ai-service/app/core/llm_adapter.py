import os
import json
import logging
import re
from typing import Type, Any, Optional, List
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMAdapter:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.models_to_try = [
            settings.GEMINI_MODEL or "gemini-3.6-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite"
        ]
        self._init_client()

    def _init_client(self):
        try:
            if self.provider == "gemini" and self.gemini_key:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.gemini_key)
                logger.info(f"Initialized Google GenAI client with models: {self.models_to_try}")
            elif self.provider == "openai" and settings.OPENAI_API_KEY:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            elif self.provider == "groq" and settings.GROQ_API_KEY:
                from openai import OpenAI
                self.openai_client = OpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=settings.GROQ_API_KEY
                )
            else:
                logger.info(f"LLM Adapter initialized with provider: {self.provider}")
        except Exception as e:
            logger.warning(f"Could not initialize LLM client: {e}. Fallback mode active.")

    async def generate_structured(self, prompt: str, schema_class: Type[BaseModel]) -> BaseModel:
        """
        Generates structured response strictly adhering to the given Pydantic schema class.
        """
        if self.provider == "gemini" and hasattr(self, "gemini_client"):
            for model_name in self.models_to_try:
                try:
                    full_prompt = (
                        f"{prompt}\n\n"
                        "CRITICAL: Return strictly a valid JSON object matching this schema. "
                        "Do NOT wrap with markdown, do not write preamble or explanations, return ONLY the raw JSON object:\n"
                        f"{json.dumps(schema_class.model_json_schema())}"
                    )
                    res = self.gemini_client.models.generate_content(
                        model=model_name,
                        contents=full_prompt
                    )
                    if res.text and res.text.strip():
                        cleaned = self._clean_json_string(res.text)
                        return schema_class.model_validate_json(cleaned)
                except Exception as e:
                    logger.warning(f"Gemini structured call on {model_name} failed: {e}. Trying next model.")

        # Fallback Dynamic Synthesizer
        return self._generate_fallback(prompt, schema_class)

    async def generate_chat_text(self, system_instruction: str, user_message: str, history: list = None) -> str:
        """
        Generates conversational plain text for the AI Tutor with rich Markdown formatting.
        """
        if self.provider == "gemini" and hasattr(self, "gemini_client"):
            history_context = ""
            if history:
                for h in history[-4:]:
                    history_context += f"{h.get('role', 'user')}: {h.get('content', '')}\n"

            full_prompt = (
                f"System Context & Role:\n{system_instruction}\n\n"
                f"Conversation History:\n{history_context}\n\n"
                f"Student Query: {user_message}\n\n"
                "Provide a direct, complete, and pedagogical answer. "
                "If the user asks for code (e.g. HTML, Java, Python, SQL), provide complete working code wrapped in markdown code blocks with clear explanations."
            )
            for model_name in self.models_to_try:
                try:
                    response = self.gemini_client.models.generate_content(
                        model=model_name,
                        contents=full_prompt
                    )
                    if response.text and response.text.strip():
                        return response.text.strip()
                except Exception as e:
                    logger.warning(f"Gemini chat on {model_name} failed: {e}")

        # Dynamic Fallback Tutor Response
        return self._generate_dynamic_tutor_reply(user_message)

    def _clean_json_string(self, text: str) -> str:
        """Cleans markdown code blocks (```json ... ```) from LLM output."""
        text = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"^```\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"```$", "", text, flags=re.MULTILINE)
        return text.strip()

    def _generate_dynamic_tutor_reply(self, message: str) -> str:
        """Provides an intelligent formatted markdown response if LLM API is temporarily rate limited."""
        msg_lower = message.lower()
        if "html" in msg_lower:
            return (
                "### 🌐 HTML Starter Code\n\n"
                "Here is a complete, modern HTML5 starter document:\n\n"
                "```html\n"
                "<!DOCTYPE html>\n"
                "<html lang=\"en\">\n"
                "<head>\n"
                "  <meta charset=\"UTF-8\">\n"
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
                "  <title>My First Web Page</title>\n"
                "  <style>\n"
                "    body { font-family: sans-serif; padding: 2rem; background: #0f172a; color: #fff; }\n"
                "    .card { background: #1e293b; padding: 1.5rem; border-radius: 8px; }\n"
                "  </style>\n"
                "</head>\n"
                "<body>\n"
                "  <div class=\"card\">\n"
                "    <h1>Hello, World! 🚀</h1>\n"
                "    <p>Welcome to HTML development.</p>\n"
                "  </div>\n"
                "</body>\n"
                "</html>\n"
                "```"
            )
        elif "java" in msg_lower:
            return (
                "### ☕ Java Class Example\n\n"
                "```java\n"
                "public class HelloWorld {\n"
                "    public static void main(String[] args) {\n"
                "        System.out.println(\"Hello, World!\");\n"
                "    }\n"
                "}\n"
                "```"
            )
        elif "python" in msg_lower:
            return (
                "### 🐍 Python Example\n\n"
                "```python\n"
                "def main():\n"
                "    print('Hello, World!')\n\n"
                "if __name__ == '__main__':\n"
                "    main()\n"
                "```"
            )
        else:
            return (
                f"### 💡 Concept Overview: {message}\n\n"
                "Here is how to understand this step-by-step:\n\n"
                "1. **Core Principle:** Identify the baseline requirements and constraints.\n"
                "2. **Implementation:** Build modular and test incrementally.\n"
                "3. **Verification:** Test boundary conditions and verify results.\n\n"
                "What specific aspect would you like to dive deeper into?"
            )

    def _generate_fallback(self, prompt: str, schema_class: Type[BaseModel]) -> BaseModel:
        """Synthesizes structured data safely ensuring all fields are fully populated."""
        schema_name = schema_class.__name__
        logger.info(f"Generating rich fallback schema for: {schema_name}")

        topic_match = re.search(r"Topic:\s*\"([^\"]+)\"", prompt) or re.search(r"topic:\s*'([^']+)'", prompt)
        goal_match = re.search(r"Goal:\s*\"([^\"]+)\"", prompt) or re.search(r"goal:\s*'([^']+)'", prompt) or re.search(r"learning:\s*\"([^\"]+)\"", prompt)
        topic_name = topic_match.group(1) if topic_match else "Core Fundamentals"
        goal_name = goal_match.group(1) if goal_match else "Complete Mastery Course"

        if "DiagnosticAssessment" in schema_name:
            return schema_class(
                goal=goal_name,
                topics_covered=["Core Syntax & Architecture", "Data Structures & Storage", "Algorithms & Logic", "Best Practices"],
                questions=[
                    {
                        "id": 1,
                        "topic": "Core Syntax & Architecture",
                        "question_text": f"What is the foundational execution mental model when working with {goal_name}?",
                        "options": [
                            "Structured modular components operating in runtime memory",
                            "Only static precompiled binary blocks",
                            "Unstructured scripts without boundary checks",
                            "Direct hardware manipulation only"
                        ],
                        "correct_answer": "Structured modular components operating in runtime memory",
                        "explanation": "Modern systems emphasize modular architecture and memory safety."
                    },
                    {
                        "id": 2,
                        "topic": "Data Structures & Storage",
                        "question_text": "Which structure provides O(1) average time complexity for key-value lookups?",
                        "options": ["HashMap / Hash Table", "Array List", "Binary Search Tree", "Linked List"],
                        "correct_answer": "HashMap / Hash Table",
                        "explanation": "Hash tables compute array indices via hashing functions in O(1) average time."
                    },
                    {
                        "id": 3,
                        "topic": "Algorithms & Logic",
                        "question_text": "When optimizing system performance, which algorithmic metric measures memory utilization as input size scales?",
                        "options": ["Space Complexity", "Time Complexity", "Throughput", "Clock Rate"],
                        "correct_answer": "Space Complexity",
                        "explanation": "Space complexity evaluates auxiliary memory consumption as input N grows."
                    }
                ]
            )
        elif "RoadmapModule" in schema_name or "Remedial" in schema_name:
            return schema_class(
                title=f"Remedial Mastery Lab: Reinforcing {topic_name}",
                topic_name=f"{topic_name} Remedial",
                description=f"Targeted review micro-lesson designed to solidify foundational concepts in {topic_name}.",
                sequence_order=1,
                difficulty_level="BEGINNER",
                estimated_minutes=25,
                key_subtopics=["Foundational Review", "Common Gotchas", "Hands-on Practice Drill"]
            )
        elif "CourseRoadmap" in schema_name or "LearningPlan" in schema_name:
            return schema_class(
                course_title=goal_name,
                category="Specialized Track",
                summary=f"Structured beginner-to-advanced curriculum for {goal_name}.",
                estimated_total_weeks=6,
                modules=[
                    {
                        "title": f"Module 1: Foundations of {goal_name}",
                        "topic_name": f"{goal_name} Basics",
                        "description": f"Master the baseline syntax, core mechanisms, and mental model of {goal_name}.",
                        "sequence_order": 1,
                        "difficulty_level": "BEGINNER",
                        "estimated_minutes": 60,
                        "key_subtopics": ["Fundamentals", "Core Concepts", "Best Practices"]
                    },
                    {
                        "title": f"Module 2: Intermediate Patterns & Workflows in {goal_name}",
                        "topic_name": f"{goal_name} Intermediate",
                        "description": f"Explore structural patterns, algorithms, and practical workflows.",
                        "sequence_order": 2,
                        "difficulty_level": "INTERMEDIATE",
                        "estimated_minutes": 90,
                        "key_subtopics": ["Design Patterns", "Data Processing", "Error Boundaries"]
                    },
                    {
                        "title": f"Module 3: Advanced Optimization & Production Standards",
                        "topic_name": f"{goal_name} Advanced",
                        "description": f"Scale performance, security, and real-world system architecture.",
                        "sequence_order": 3,
                        "difficulty_level": "ADVANCED",
                        "estimated_minutes": 120,
                        "key_subtopics": ["Performance Tuning", "Security", "Production Deployment"]
                    },
                    {
                        "title": f"Module 4: Real-World Capstone Project",
                        "topic_name": f"{goal_name} Capstone",
                        "description": f"Build and validate an end-to-end portfolio project testing all learned skills.",
                        "sequence_order": 4,
                        "difficulty_level": "ADVANCED",
                        "estimated_minutes": 180,
                        "key_subtopics": ["End-to-End Build", "Testing", "Evaluation"]
                    }
                ]
            )
        elif "LessonContent" in schema_name:
            return schema_class(
                topic_name=topic_name,
                overview=f"This comprehensive module covers the architectural principles, syntax, and real-world implementation of **{topic_name}**.",
                core_concepts_markdown=(
                    f"### Core Concepts & Mechanics of {topic_name}\n\n"
                    f"1. **Foundational Architecture:** How {topic_name} operates at runtime.\n"
                    "2. **State & Control Flow:** Managing inputs, state mutations, and data propagation.\n"
                    "3. **Defensive Design:** Implementing error handling, boundary conditions, and clean syntax."
                ),
                practical_examples_markdown=(
                    f"```\n"
                    f"// Practical implementation for {topic_name}\n"
                    f"// Step 1: Initialize components\n"
                    f"// Step 2: Execute core logic\n"
                    f"// Step 3: Verify and validate output\n"
                    f"```"
                ),
                common_pitfalls_markdown=(
                    f"- Skipping input validation and boundary checks.\n"
                    f"- Conflating concerns rather than modularizing functions.\n"
                    f"- Ignoring error handling and exception cases."
                ),
                key_takeaways=[
                    f"Understood core architecture of {topic_name}",
                    "Implemented clean, modular patterns",
                    "Learned to avoid common anti-patterns",
                    "Ready to validate learning via milestone quiz"
                ],
                recommended_video_resources=[
                    {
                        "title": f"{topic_name} Full Course Tutorial",
                        "channel_name": "FreeCodeCamp / Traversy Media",
                        "search_query": f"{topic_name} full tutorial beginner to advanced",
                        "description": f"Comprehensive video tutorial covering all practical aspects of {topic_name}."
                    },
                    {
                        "title": f"Mastering {topic_name} Crash Course",
                        "channel_name": "Tech With Tim / Fireship",
                        "search_query": f"{topic_name} crash course explained",
                        "description": "Fast-paced visual summary with analogies and live examples."
                    }
                ]
            )
        elif "CustomAssessment" in schema_name:
            return schema_class(
                topic_name=topic_name,
                title=f"{topic_name} Comprehensive Assessment",
                mcqs=[
                    {
                        "question_text": f"What is the primary architectural advantage of mastering {topic_name}?",
                        "options": [
                            "Enables modular, scalable, and maintainable solutions",
                            "Only useful for legacy monolithic systems",
                            "Slows down execution time",
                            "None of the above"
                        ],
                        "correct_answer": "Enables modular, scalable, and maintainable solutions",
                        "explanation": f"{topic_name} provides architectural scalability and modularity.",
                        "points": 1
                    }
                ],
                descriptive={
                    "question_text": f"Explain the core mechanics of {topic_name} and describe a scenario where you would apply it.",
                    "sample_answer": f"{topic_name} is used to structure data and execution flow efficiently...",
                    "evaluation_rubric": "Clarity of explanation (2 pts), practical scenario (2 pts), edge cases (1 pt).",
                    "points": 5
                },
                coding={
                    "title": f"{topic_name} Implementation Challenge",
                    "problem_statement": f"Write a clean function/script demonstrating the core logic of {topic_name}.",
                    "constraints": "Time Complexity: O(N), Space Complexity: O(1)",
                    "starter_code": f"// Implement your solution for {topic_name}\nfunction solution(input) {{\n    return input;\n}}",
                    "test_cases": [
                        {"input_data": "sampleInput", "expected_output": "sampleInput", "is_hidden": False}
                    ],
                    "points": 10
                }
            )

        return schema_class()

llm_adapter = LLMAdapter()
