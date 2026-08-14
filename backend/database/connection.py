from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from core.config import settings

# connect_args needed only for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

try:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
    print("Database connection successful")
except OperationalError as e:
    print(f"Database connection failed: {e}")
    print("Please check your DATABASE_URL in .env file")
    print("Ensure PostgreSQL is running and credentials are correct")
    print("Falling back to SQLite for development...")
    # Fallback to SQLite for development
    fallback_url = "sqlite:///./churn_ai.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(fallback_url, connect_args=connect_args)
    print(f"Using SQLite database: {fallback_url}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()