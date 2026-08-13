import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from core.security import get_current_user_email
from database.connection import get_db
from db_models.prediction import Prediction
from db_models.user import User
from ml.predictor import predict_churn
from schemas.prediction import BulkUploadResponse, PredictionResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=BulkUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file")

    if "customer_id" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must include a 'customer_id' column")

    user = db.query(User).filter(User.email == current_email).first()
    results = []

    for _, row in df.iterrows():
        features = row.to_dict()
        probability, label = predict_churn(features)

        record = Prediction(
            customer_id=str(features["customer_id"]),
            churn_probability=probability,
            churn_label=label,
            owner_id=user.id if user else None,
        )
        db.add(record)

        results.append(
            PredictionResponse(
                customer_id=str(features["customer_id"]),
                churn_probability=probability,
                churn_label=label,
            )
        )

    db.commit()

    return BulkUploadResponse(total_records=len(results), results=results)