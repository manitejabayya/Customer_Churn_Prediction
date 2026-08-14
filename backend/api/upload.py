import io
import os
import tempfile
from typing import Dict, List

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.security import get_current_user_email
from database.connection import get_db
from db_models.prediction import Prediction
from db_models.user import User
from schemas.prediction import BulkUploadResponse, OverviewData
from services.prediction_service import get_prediction_service

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=BulkUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    """Upload CSV file and process predictions for all customers"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV file: {str(e)}")

    # Validate required columns
    required_columns = ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 
                       'PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup',
                       'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
                       'PaperlessBilling', 'MonthlyCharges', 'TotalCharges']
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must include the following columns: {', '.join(missing_columns)}"
        )

    # Convert DataFrame to list of dictionaries
    customers_data = df.to_dict('records')
    
    # Get prediction service
    prediction_service = get_prediction_service()
    
    # Process predictions
    result = prediction_service.predict_batch_churn(customers_data)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    # Store predictions in database
    user = db.query(User).filter(User.email == current_email).first()
    
    for customer_result in result['data']:
        record = Prediction(
            customer_id=str(customer_result['original_data'].get('customer_id', f"cust_{hash(str(customer_result['original_data']))}")),
            churn_probability=customer_result['probability'],
            churn_label="Yes" if customer_result['prediction'] == 1 else "No",
            owner_id=user.id if user else None,
        )
        db.add(record)
    
    db.commit()
    
    # Format response
    formatted_results = []
    for customer_result in result['data']:
        formatted_results.append({
            'customer_id': str(customer_result['original_data'].get('customer_id', f"cust_{hash(str(customer_result['original_data']))}")),
            'churn_probability': customer_result['probability'],
            'churn_label': "Yes" if customer_result['prediction'] == 1 else "No",
            'churn_reason': customer_result.get('churn_reason'),
            'recommendations': customer_result.get('recommendations')
        })
    
    return BulkUploadResponse(
        total_records=len(formatted_results),
        results=formatted_results,
        overview=result['overview']
    )


@router.get("/overview", response_model=OverviewData)
async def get_upload_overview(
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    """Get overview data for visualization from recent predictions"""
    user = db.query(User).filter(User.email == current_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get recent predictions for the user
    predictions = db.query(Prediction).filter(
        Prediction.owner_id == user.id
    ).order_by(Prediction.created_at.desc()).limit(1000).all()
    
    if not predictions:
        return OverviewData(
            total_customers=0,
            churn_risk={'high': 0, 'medium': 0, 'low': 0},
            churn_by_contract={},
            churn_by_internet_service={},
            churn_by_payment_method={},
            average_tenure_churn=0.0,
            average_tenure_no_churn=0.0,
            monthly_charges_distribution={'min': 0.0, 'max': 0.0, 'avg': 0.0}
        )
    
    # Convert to list of dictionaries for processing
    predictions_data = []
    for pred in predictions:
        predictions_data.append({
            'prediction': 1 if pred.churn_label == "Yes" else 0,
            'probability': pred.churn_probability
        })
    
    # Get prediction service to generate overview
    prediction_service = get_prediction_service()
    overview = prediction_service.predictor.generate_overview_data(predictions_data)
    
    return OverviewData(**overview)


@router.post("/download")
async def download_results(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_email: str = Depends(get_current_user_email),
):
    """Upload CSV, process predictions, and download results with recommendations"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV file: {str(e)}")

    # Validate required columns
    required_columns = ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 
                       'PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup',
                       'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
                       'PaperlessBilling', 'MonthlyCharges', 'TotalCharges']
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must include the following columns: {', '.join(missing_columns)}"
        )

    # Convert DataFrame to list of dictionaries
    customers_data = df.to_dict('records')
    
    # Get prediction service
    prediction_service = get_prediction_service()
    
    # Process predictions
    result = prediction_service.predict_batch_churn(customers_data)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    # Create results DataFrame
    results_data = []
    for customer_result in result['data']:
        original = customer_result['original_data'].copy()
        original['Churn_Probability'] = customer_result['probability']
        original['Churn_Prediction'] = "Yes" if customer_result['prediction'] == 1 else "No"
        original['Churn_Reason'] = customer_result.get('churn_reason', 'N/A')
        original['Recommendations'] = '; '.join(customer_result.get('recommendations', []))
        results_data.append(original)
    
    results_df = pd.DataFrame(results_data)
    
    # Create temporary file for download
    temp_dir = tempfile.gettempdir()
    output_filename = f"churn_predictions_{current_email.replace('@', '_')}.csv"
    output_path = os.path.join(temp_dir, output_filename)
    
    results_df.to_csv(output_path, index=False)
    
    # Store predictions in database
    user = db.query(User).filter(User.email == current_email).first()
    
    for customer_result in result['data']:
        record = Prediction(
            customer_id=str(customer_result['original_data'].get('customer_id', f"cust_{hash(str(customer_result['original_data']))}")),
            churn_probability=customer_result['probability'],
            churn_label="Yes" if customer_result['prediction'] == 1 else "No",
            owner_id=user.id if user else None,
        )
        db.add(record)
    
    db.commit()
    
    return FileResponse(
        output_path,
        media_type='text/csv',
        filename=f"churn_analysis_results.csv",
        background=lambda: os.remove(output_path)
    )