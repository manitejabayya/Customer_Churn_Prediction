from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, report
from core.config import settings
from database.connection import Base, engine

# Creates tables if they don't exist yet (fine for dev; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(report.router)

# Keep ML-dependent routes optional so auth/report/db APIs can run independently.
try:
    from api import predict, upload

    app.include_router(predict.router)
    app.include_router(upload.router)
    print("ML routes loaded successfully")
except ImportError as exc:
    print(f"ML routes disabled during startup: {exc}")
except Exception as exc:
    print(f"ML routes disabled during startup: {exc}")


@app.get("/")
def root():
    return {"status": "ok", "message": "Churn Prediction API is running"}