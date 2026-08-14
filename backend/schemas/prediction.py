from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    """Single customer's feature values. Adjust fields to match your model's inputs."""
    customer_id: str
    tenure: int
    monthly_charges: float
    total_charges: float
    contract_type: str        # e.g. "Month-to-month", "One year", "Two year"
    internet_service: str      # e.g. "DSL", "Fiber optic", "No"
    payment_method: str
    # add any other features your trained model expects


class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    churn_label: str


class PredictionHistoryItem(BaseModel):
    id: int
    customer_id: str
    churn_probability: float
    churn_label: str
    created_at: datetime

    class Config:
        from_attributes = True


class BulkUploadResponse(BaseModel):
    total_records: int
    results: List[PredictionResponse]


class ReportSummary(BaseModel):
    total_predictions: int
    churn_count: int
    no_churn_count: int
    average_churn_probability: float