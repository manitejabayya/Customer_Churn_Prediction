from typing import List
import json
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.security import get_current_user_email
from database.connection import get_db
from db_models.prediction import Prediction
from db_models.user import User
from schemas.prediction import PredictionHistoryItem, ReportSummary, HighRiskCustomer, HighRiskCustomersResponse, ChurnDriver, ChurnDriversResponse

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
    churn_count = sum(1 for r in records if r.churn_label == "Yes")
    avg_prob = round(sum(r.churn_probability for r in records) / total, 4) if total else 0.0

    return ReportSummary(
        total_predictions=total,
        churn_count=churn_count,
        no_churn_count=total - churn_count,
        average_churn_probability=avg_prob,
    )


@router.get("/high-risk", response_model=HighRiskCustomersResponse)
def get_high_risk_customers(
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    """Get customers with high churn probability (>70%)"""
    user = db.query(User).filter(User.email == current_email).first()
    records = (
        db.query(Prediction)
        .filter(Prediction.owner_id == user.id)
        .filter(Prediction.churn_probability > 0.7)
        .order_by(Prediction.churn_probability.desc())
        .limit(10)
        .all()
    )

    high_risk_customers = []
    for record in records:
        # Parse original data to get churn reason and recommendations
        original_data = {}
        if record.original_data:
            try:
                original_data = json.loads(record.original_data)
            except:
                pass

        # Determine risk level based on probability
        prob = record.churn_probability
        if prob > 0.8:
            risk = "High"
        elif prob > 0.5:
            risk = "Medium"
        else:
            risk = "Low"

        # Extract or generate reason
        reason = original_data.get('churn_reason', 'High churn probability')
        
        # Extract or generate action from recommendations
        recommendations = original_data.get('recommendations', [])
        action = recommendations[0] if recommendations else "Retention offer"

        high_risk_customers.append(
            HighRiskCustomer(
                id=record.customer_id,
                probability=f"{int(prob * 100)}%",
                risk=risk,
                reason=reason,
                action=action,
            )
        )

    return HighRiskCustomersResponse(
        customers=high_risk_customers,
        total=len(high_risk_customers),
    )


@router.get("/churn-drivers", response_model=ChurnDriversResponse)
def get_churn_drivers(
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    """Calculate top churn drivers from customer data"""
    user = db.query(User).filter(User.email == current_email).first()
    records = db.query(Prediction).filter(Prediction.owner_id == user.id).all()

    # Analyze churn drivers from original customer data
    contract_types = []
    internet_services = []
    payment_methods = []
    high_monthly_charges = 0
    low_tenure = 0
    no_tech_support = 0

    for record in records:
        if record.original_data:
            try:
                original_data = json.loads(record.original_data)
                
                # Only analyze customers likely to churn
                if record.churn_probability > 0.5:
                    contract_types.append(original_data.get('Contract', 'Unknown'))
                    internet_services.append(original_data.get('InternetService', 'Unknown'))
                    payment_methods.append(original_data.get('PaymentMethod', 'Unknown'))
                    
                    # Analyze specific factors
                    monthly_charges = original_data.get('MonthlyCharges', 0)
                    if isinstance(monthly_charges, (int, float)) and monthly_charges > 70:
                        high_monthly_charges += 1
                    
                    tenure = original_data.get('tenure', 0)
                    if isinstance(tenure, (int, float)) and tenure < 12:
                        low_tenure += 1
                    
                    tech_support = original_data.get('TechSupport', 'No')
                    if tech_support == 'No':
                        no_tech_support += 1
            except:
                pass

    # Calculate driver percentages
    total_churn_risk = len([r for r in records if r.churn_probability > 0.5]) if records else 1
    
    drivers = []
    
    # Contract type analysis
    if contract_types:
        month_to_month = contract_types.count('Month-to-month')
        if month_to_month > 0:
            drivers.append(ChurnDriver(
                name="Month-to-month contracts",
                value=int((month_to_month / total_churn_risk) * 100),
                icon="RefreshCw"
            ))
    
    # High monthly charges
    if high_monthly_charges > 0:
        drivers.append(ChurnDriver(
            name="High monthly charges",
            value=int((high_monthly_charges / total_churn_risk) * 100),
            icon="CircleDollarSign"
        ))
    
    # Low tenure
    if low_tenure > 0:
        drivers.append(ChurnDriver(
            name="Short customer tenure",
            value=int((low_tenure / total_churn_risk) * 100),
            icon="Clock"
        ))
    
    # No tech support
    if no_tech_support > 0:
        drivers.append(ChurnDriver(
            name="No technical support",
            value=int((no_tech_support / total_churn_risk) * 100),
            icon="Headphones"
        ))
    
    # Internet service analysis
    if internet_services:
        fiber_optic = internet_services.count('Fiber optic')
        if fiber_optic > 0:
            drivers.append(ChurnDriver(
                name="Fiber optic service",
                value=int((fiber_optic / total_churn_risk) * 100),
                icon="Wifi"
            ))
    
    # Sort by value and take top 3
    drivers.sort(key=lambda x: x.value, reverse=True)
    top_drivers = drivers[:3]
    
    # Normalize to ensure they sum to 100%
    if top_drivers:
        total_value = sum(d.value for d in top_drivers)
        if total_value > 0:
            for driver in top_drivers:
                driver.value = int((driver.value / total_value) * 100)
    
    return ChurnDriversResponse(
        drivers=top_drivers,
        total=len(top_drivers)
    )