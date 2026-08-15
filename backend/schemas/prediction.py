from datetime import datetime
from typing import List, Optional, Dict, Any

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
    senior_citizen: int = 0
    # Optional boolean fields (will default to 0 if not provided)
    partner: bool = False
    dependents: bool = False
    phone_service: bool = False
    multiple_lines: bool = False
    online_security: bool = False
    online_backup: bool = False
    device_protection: bool = False
    tech_support: bool = False
    streaming_tv: bool = False
    streaming_movies: bool = False
    paperless_billing: bool = False
    gender: str = "Female"  # "Male" or "Female"


class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    churn_label: str
    churn_reason: Optional[str] = None
    recommendations: Optional[List[str]] = None


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
    overview: Optional[Dict[str, Any]] = None


class ReportSummary(BaseModel):
    total_predictions: int
    churn_count: int
    no_churn_count: int
    average_churn_probability: float


class OverviewData(BaseModel):
    total_customers: int
    churn_risk: Dict[str, int]  # high, medium, low
    churn_by_contract: Dict[str, int]
    churn_by_internet_service: Dict[str, int]
    churn_by_payment_method: Dict[str, int]
    average_tenure_churn: float
    average_tenure_no_churn: float
    monthly_charges_distribution: Dict[str, float]


class CustomerAnalysis(BaseModel):
    customer_id: str
    original_data: Dict[str, Any]
    churn_probability: float
    churn_label: str
    churn_reason: str
    recommendations: List[str]


class HighRiskCustomer(BaseModel):
    id: str
    probability: str
    risk: str
    reason: str
    action: str


class HighRiskCustomersResponse(BaseModel):
    customers: List[HighRiskCustomer]
    total: int


class ChurnDriver(BaseModel):
    name: str
    value: int
    icon: str


class ChurnDriversResponse(BaseModel):
    drivers: List[ChurnDriver]
    total: int