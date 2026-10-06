import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "inception")
    INCEPTION_API_KEY: str = os.getenv("INCEPTION_API_KEY", "")
    INCEPTION_BASE_URL: str = os.getenv("INCEPTION_BASE_URL", "https://api.inceptionlabs.ai/v1")
    INCEPTION_MODEL: str = os.getenv("INCEPTION_MODEL", "mercury-2.5")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
