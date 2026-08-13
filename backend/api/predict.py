from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.security import get_current_user_email
from database.connection import get_db
from db_models.prediction import Prediction
from db_models.user import User
from ml.predictor import predict_churn
from schemas.prediction import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResponse)
def predict_single(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    probability, label = predict_churn(payload.dict())

    user = db.query(User).filter(User.email == current_email).first()
    record = Prediction(
        customer_id=payload.customer_id,
        churn_probability=probability,
        churn_label=label,
        owner_id=user.id if user else None,
    )
    db.add(record)
    db.commit()

    return PredictionResponse(
        customer_id=payload.customer_id,
        churn_probability=probability,
        churn_label=label,
    )