from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Churn Prediction API"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # Auth / JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173" 

    # ML
    MODEL_PATH: str = "ml/saved_model/churn_model.pkl"

    class Config:
        env_file = ".env"


settings = Settings()