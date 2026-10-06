import os
import json
import logging
import re
import asyncio
from typing import Type, Any, Optional, List
from pydantic import BaseModel
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMAdapter:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.inception_key = settings.INCEPTION_API_KEY
        self.inception_base_url = settings.INCEPTION_BASE_URL
        self.inception_model = settings.INCEPTION_MODEL or "mercury-2.5"
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_models = [
            settings.GEMINI_MODEL or "gemini-3.8-flash",
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash"
        ]
        self._init_clients()

    def _init_clients(self):
        # 1. Initialize Inception / OpenAI-compatible client
        if self.inception_key:
            try:
                self.openai_client = OpenAI(
                    base_url=self.inception_base_url,
                    api_key=self.inception_key,
                    timeout=60.0
                )
                logger.info(f"Initialized OpenAI-compatible client for Inception Labs ({self.inception_base_url}) using model: {self.inception_model}")
            except Exception as e:
                logger.error(f"Failed to initialize Inception Labs client: {e}")

        # 2. Initialize Gemini client (as secondary fallback or when provider is gemini)
        if self.gemini_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.gemini_key)
                logger.info("Initialized Google GenAI client")
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI client: {e}")

    async def generate_structured(self, prompt: str, schema_class: Type[BaseModel]) -> BaseModel:
        """
        Generates structured response strictly adhering to the given Pydantic schema class.
        Strictly raises an exception if the LLM fails - NEVER produces fake mock data.
        """
        schema_json = json.dumps(schema_class.model_json_schema())
        system_msg = (
            "You are an expert educational AI reasoning engine. "
            "Your task is to generate output strictly conforming to the JSON schema provided below. "
            "CRITICAL: Return ONLY valid raw JSON without preamble, markdown code blocks, or explanations:\n"
            f"{schema_json}"
        )
        user_msg = (
            f"{prompt}\n\n"
            "Return ONLY the raw JSON object adhering to the schema."
        )

        last_error = None

        # 1. Primary: Inception Labs / OpenAI-compatible
        if self.provider in ["inception", "openai", "openai_compatible"] or hasattr(self, "openai_client"):
            try:
                logger.info(f"Generating structured {schema_class.__name__} using Inception Labs ({self.inception_model})...")
                response = await asyncio.to_thread(
                    self.openai_client.chat.completions.create,
                    model=self.inception_model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    max_tokens=3500
                )
                
                raw_text = response.choices[0].message.content or ""
                if raw_text.strip():
                    cleaned = self._clean_json_string(raw_text)
                    try:
                        parsed_dict = json.loads(cleaned, strict=False)
                    except Exception:
                        sanitized = re.sub(r',\s*([\]}])', r'\1', cleaned)
                        sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', sanitized)
                        parsed_dict = json.loads(sanitized, strict=False)
                    
                    return schema_class.model_validate(parsed_dict)
            except Exception as e:
                last_error = e
                logger.error(f"Inception Labs structured call failed: {e}")

        # 2. Secondary: Gemini
        if hasattr(self, "gemini_client"):
            for model_name in self.gemini_models:
                try:
                    logger.info(f"Attempting Gemini structured call on {model_name}...")
                    full_prompt = f"{system_msg}\n\n{user_msg}"
                    res = await asyncio.to_thread(
                        self.gemini_client.models.generate_content,
                        model=model_name,
                        contents=full_prompt
                    )
                    if res.text and res.text.strip():
                        cleaned = self._clean_json_string(res.text)
                        try:
                            parsed_dict = json.loads(cleaned, strict=False)
                        except Exception:
                            sanitized = re.sub(r',\s*([\]}])', r'\1', cleaned)
                            sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', sanitized)
                            parsed_dict = json.loads(sanitized, strict=False)
                        return schema_class.model_validate(parsed_dict)
                except Exception as e:
                    last_error = e
                    logger.warning(f"Gemini call on {model_name} failed: {e}")

        raise RuntimeError(f"AI LLM Service failed to generate structured response for {schema_class.__name__}: {last_error}")

    async def generate_chat_text(self, system_instruction: str, user_message: str, history: list = None) -> str:
        """
        Generates conversational plain text for the AI Tutor with rich Markdown formatting.
        Strictly raises an exception if the LLM fails - NEVER produces fake mock data.
        """
        last_error = None

        # 1. Primary: Inception Labs / OpenAI-compatible
        if self.provider in ["inception", "openai", "openai_compatible"] or hasattr(self, "openai_client"):
            try:
                messages = [{"role": "system", "content": system_instruction}]
                if history:
                    for h in history[-6:]:
                        messages.append({
                            "role": h.get("role", "user"),
                            "content": h.get("content", "")
                        })
                messages.append({"role": "user", "content": user_message})

                logger.info(f"Generating tutor response using Inception Labs ({self.inception_model})...")
                response = await asyncio.to_thread(
                    self.openai_client.chat.completions.create,
                    model=self.inception_model,
                    messages=messages,
                    max_tokens=2500
                )
                content = response.choices[0].message.content or ""
                if content.strip():
                    return content.strip()
            except Exception as e:
                last_error = e
                logger.error(f"Inception Labs chat call failed: {e}")

        # 2. Secondary: Gemini
        if hasattr(self, "gemini_client"):
            history_context = ""
            if history:
                for h in history[-4:]:
                    history_context += f"{h.get('role', 'user')}: {h.get('content', '')}\n"

            full_prompt = (
                f"System Context & Role:\n{system_instruction}\n\n"
                f"Conversation History:\n{history_context}\n\n"
                f"Student Query: {user_message}\n\n"
                "Provide a direct, complete, and pedagogical answer in rich Markdown."
            )
            for model_name in self.gemini_models:
                try:
                    res = await asyncio.to_thread(
                        self.gemini_client.models.generate_content,
                        model=model_name,
                        contents=full_prompt
                    )
                    if res.text and res.text.strip():
                        return res.text.strip()
                except Exception as e:
                    last_error = e
                    logger.warning(f"Gemini chat on {model_name} failed: {e}")

        raise RuntimeError(f"AI LLM Service failed to generate chat response: {last_error}")

    def _clean_json_string(self, text: str) -> str:
        """Robustly extracts clean JSON object from LLM markdown output and strips invalid syntax."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end+1]
        text = re.sub(r',\s*([\]}])', r'\1', text)
        return text

llm_adapter = LLMAdapter()
