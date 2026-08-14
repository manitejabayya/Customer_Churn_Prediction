from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Churn Prediction API"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./churn.db"
    # For Postgres, use something like:
    # DATABASE_URL: str = "postgresql://user:password@localhost:5432/churn_db"

    # Auth / JWT
    SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_SECRET_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"  # Vite default; use 3000 for CRA

    # ML
    MODEL_PATH: str = "ml/saved_model/churn_model.pkl"

    class Config:
        env_file = ".env"


settings = Settings()