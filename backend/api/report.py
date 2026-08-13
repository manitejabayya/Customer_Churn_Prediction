from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.security import get_current_user_email
from database.connection import get_db
from db_models.prediction import Prediction
from db_models.user import User
from schemas.prediction import PredictionHistoryItem, ReportSummary

router = APIRouter(prefix="/report", tags=["Report"])


@router.get("/history", response_model=List[PredictionHistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_email).first()
    records = (
        db.query(Prediction)
        .filter(Prediction.owner_id == user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return records


@router.get("/summary", response_model=ReportSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_email).first()
    records = db.query(Prediction).filter(Prediction.owner_id == user.id).all()

    total = len(records)
    churn_count = sum(1 for r in records if r.churn_label == "Churn")
    avg_prob = round(sum(r.churn_probability for r in records) / total, 4) if total else 0.0

    return ReportSummary(
        total_predictions=total,
        churn_count=churn_count,
        no_churn_count=total - churn_count,
        average_churn_probability=avg_prob,
    )