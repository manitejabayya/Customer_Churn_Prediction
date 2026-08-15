import pandas as pd
import numpy as np
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from model_loader import ModelLoader


class ChurnPredictor:
    def __init__(self, models_dir):
        self.model_loader = ModelLoader(models_dir)
        self.is_loaded = False
        
    def load_models(self):
        """Load the preprocessor and best model"""
        self.is_loaded = self.model_loader.load_all()
        return self.is_loaded
    
    def transform_input_to_model_format(self, input_data):
        """Transform simple input format to one-hot encoded model format for new dataset"""
        if isinstance(input_data, dict):
            input_data = [input_data]
        
        transformed_data = []
        for data in input_data:
            # Initialize all features with 0 for new dataset structure
            feature_dict = {
                'Age': data.get('age', 0),
                'Gender': data.get('gender', 0),
                'Dependents': data.get('dependents', 0),
                'Tenure_Months': data.get('tenure_months', 0),
                'Num_Services': data.get('num_services', 0),
                'Traveler_Profile': data.get('traveler_profile', 0),
                'Data_Usage_GB': data.get('data_usage_gb', 0),
                'Data_Usage_Change_Pct': data.get('data_usage_change_pct', 0),
                'Call_Minutes': data.get('call_minutes', 0),
                'Num_Calls': data.get('num_calls', 0),
                'SMS_Usage': data.get('sms_usage', 0),
                'Usage_5G_4G_Pct': data.get('usage_5g_4g_pct', 0),
                'Roaming_Usage_Mins': data.get('roaming_usage_mins', 0),
                'International_Usage_Mins': data.get('international_usage_mins', 0),
                'Plan_Price': data.get('plan_price', 0),
                'Average_Monthly_Bill': data.get('average_monthly_bill', 0),
                'Current_Monthly_Bill': data.get('current_monthly_bill', 0),
                'Bill_Change_Pct': data.get('bill_change_pct', 0),
                'Late_Payments': data.get('late_payments', 0),
                'Dropped_Calls': data.get('dropped_calls', 0),
                'Network_Issues': data.get('network_issues', 0),
                'Downtime_Hours': data.get('downtime_hours', 0),
                'Complaints': data.get('complaints', 0),
                'Support_Tickets': data.get('support_tickets', 0),
                'Complaint_Resolution_Time_Hrs': data.get('complaint_resolution_time_hrs', 0),
                'Family_Status_Married': 0,
                'Family_Status_Married with Kids': 0,
                'Family_Status_Single': 0,
                'Family_Status_Single Parent': 0,
                'Location_Rural': 0,
                'Location_Suburban': 0,
                'Location_Urban': 0,
                'Contract_Type_Month-to-month': 0,
                'Contract_Type_One year': 0,
                'Contract_Type_Two year': 0,
                'Payment_Method_Bank transfer (auto)': 0,
                'Payment_Method_Credit card (auto)': 0,
                'Payment_Method_Electronic check': 0,
                'Payment_Method_Mailed check': 0,
                # Engineered features (will be calculated by preprocessor)
                'Tenure_bin': 0,
                'Bill_to_Plan_ratio': 0,
                'Bill_Change_Indicator': 0,
                'Data_to_Call_ratio': 0,
                'High_Service_User': 0,
                'Has_Late_Payments': 0,
                'Has_Support_Tickets': 0,
                'Contract_Type_Sum': 0,
                'Location_Type_Sum': 0,
                'Family_Status_Sum': 0,
                'Auto_Payment_Indicator': 0
            }
            
            # Transform family status
            family_status = data.get('family_status', '').lower()
            if 'married' in family_status and 'kids' in family_status:
                feature_dict['Family_Status_Married with Kids'] = 1
            elif 'married' in family_status:
                feature_dict['Family_Status_Married'] = 1
            elif 'single parent' in family_status:
                feature_dict['Family_Status_Single Parent'] = 1
            elif 'single' in family_status:
                feature_dict['Family_Status_Single'] = 1
            
            # Transform location
            location = data.get('location', '').lower()
            if 'rural' in location:
                feature_dict['Location_Rural'] = 1
            elif 'suburban' in location:
                feature_dict['Location_Suburban'] = 1
            elif 'urban' in location:
                feature_dict['Location_Urban'] = 1
            
            # Transform contract type
            contract = data.get('contract_type', '').lower()
            if 'month-to-month' in contract or 'month to month' in contract:
                feature_dict['Contract_Type_Month-to-month'] = 1
            elif 'one year' in contract:
                feature_dict['Contract_Type_One year'] = 1
            elif 'two year' in contract:
                feature_dict['Contract_Type_Two year'] = 1
            
            # Transform payment method
            payment = data.get('payment_method', '').lower()
            if 'bank transfer' in payment and 'auto' in payment:
                feature_dict['Payment_Method_Bank transfer (auto)'] = 1
            elif 'credit card' in payment and 'auto' in payment:
                feature_dict['Payment_Method_Credit card (auto)'] = 1
            elif 'electronic check' in payment:
                feature_dict['Payment_Method_Electronic check'] = 1
            elif 'mailed check' in payment:
                feature_dict['Payment_Method_Mailed check'] = 1
            
            # Calculate some engineered features
            if feature_dict['Current_Monthly_Bill'] > 0 and feature_dict['Plan_Price'] > 0:
                feature_dict['Bill_to_Plan_ratio'] = feature_dict['Current_Monthly_Bill'] / feature_dict['Plan_Price']
            
            if feature_dict['Data_Usage_GB'] > 0 and feature_dict['Call_Minutes'] > 0:
                feature_dict['Data_to_Call_ratio'] = feature_dict['Data_Usage_GB'] / feature_dict['Call_Minutes']
            
            if feature_dict['Late_Payments'] > 0:
                feature_dict['Has_Late_Payments'] = 1
            
            if feature_dict['Support_Tickets'] > 0:
                feature_dict['Has_Support_Tickets'] = 1
            
            if feature_dict['Num_Services'] > 5:
                feature_dict['High_Service_User'] = 1
            
            # Sum indicators
            feature_dict['Contract_Type_Sum'] = (feature_dict['Contract_Type_Month-to-month'] + 
                                                feature_dict['Contract_Type_One year'] + 
                                                feature_dict['Contract_Type_Two year'])
            
            feature_dict['Location_Type_Sum'] = (feature_dict['Location_Rural'] + 
                                               feature_dict['Location_Suburban'] + 
                                               feature_dict['Location_Urban'])
            
            feature_dict['Family_Status_Sum'] = (feature_dict['Family_Status_Married'] + 
                                                feature_dict['Family_Status_Married with Kids'] + 
                                                feature_dict['Family_Status_Single'] + 
                                                feature_dict['Family_Status_Single Parent'])
            
            feature_dict['Auto_Payment_Indicator'] = (feature_dict['Payment_Method_Bank transfer (auto)'] + 
                                                     feature_dict['Payment_Method_Credit card (auto)'])
            
            transformed_data.append(feature_dict)
        
        return transformed_data

    def preprocess_input(self, input_data):
        """Preprocess input data for prediction"""
        # Transform input to model format
        transformed_data = self.transform_input_to_model_format(input_data)
        
        df = pd.DataFrame(transformed_data)
        
        # Ensure all required features are present
        required_features = self.model_loader.preprocessor.feature_columns
        missing_features = set(required_features) - set(df.columns)
        
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Reorder columns to match training data
        df = df[required_features]
        
        # Preprocess using the loaded preprocessor
        X_processed, _ = self.model_loader.preprocessor.preprocess_data(
            df, target_column='Churn', fit=False
        )
        
        return X_processed
    
    def get_churn_reason(self, input_data, probability):
        """Determine the primary reason for churn based on new dataset features"""
        reasons = []
        
        # Check for high monthly charges
        if input_data.get('Current_Monthly_Bill', 0) > 80:
            reasons.append("High monthly charges")
        
        # Check for short tenure
        if input_data.get('Tenure_Months', 0) < 12:
            reasons.append("Short customer tenure (less than 1 year)")
        
        # Check for month-to-month contract
        if input_data.get('Contract_Type_Month-to-month', 0) == 1:
            reasons.append("Month-to-month contract (no long-term commitment)")
        
        # Check for network issues
        if input_data.get('Network_Issues', 0) > 0:
            reasons.append("Network connectivity issues")
        
        # Check for dropped calls
        if input_data.get('Dropped_Calls', 0) > 0:
            reasons.append("Frequent dropped calls")
        
        # Check for complaints
        if input_data.get('Complaints', 0) > 0:
            reasons.append("Customer complaints filed")
        
        # Check for high bill change percentage
        if input_data.get('Bill_Change_Pct', 0) > 20:
            reasons.append("Significant bill increase")
        
        # Check for late payments
        if input_data.get('Late_Payments', 0) > 0:
            reasons.append("Payment history issues")
        
        # Check for downtime
        if input_data.get('Downtime_Hours', 0) > 0:
            reasons.append("Service downtime experienced")
        
        # Check for electronic check payment
        if input_data.get('Payment_Method_Electronic check', 0) == 1:
            reasons.append("Electronic check payment method")
        
        if not reasons:
            reasons.append("Multiple factors contributing to churn risk")
        
        return reasons[0] if reasons else "General churn risk factors"
    
    def get_recommendations(self, input_data, probability):
        """Generate recommendations to reduce churn risk for new dataset"""
        recommendations = []
        
        # High monthly charges
        if input_data.get('Current_Monthly_Bill', 0) > 80:
            recommendations.append("Offer discount or promotional pricing")
            recommendations.append("Review current plan and suggest cost optimization")
        
        # Short tenure
        if input_data.get('Tenure_Months', 0) < 12:
            recommendations.append("Offer onboarding support and training")
            recommendations.append("Provide early-bird renewal incentives")
        
        # Month-to-month contract
        if input_data.get('Contract_Type_Month-to-month', 0) == 1:
            recommendations.append("Offer incentives for long-term contract")
            recommendations.append("Highlight benefits of annual plans")
        
        # Network issues
        if input_data.get('Network_Issues', 0) > 0:
            recommendations.append("Investigate network connectivity issues")
            recommendations.append("Offer service credits for downtime")
        
        # Dropped calls
        if input_data.get('Dropped_Calls', 0) > 0:
            recommendations.append("Review call quality and network coverage")
            recommendations.append("Provide signal booster if applicable")
        
        # Complaints
        if input_data.get('Complaints', 0) > 0:
            recommendations.append("Address outstanding complaints promptly")
            recommendations.append("Assign customer success representative")
        
        # Late payments
        if input_data.get('Late_Payments', 0) > 0:
            recommendations.append("Offer flexible payment arrangements")
            recommendations.append("Provide financial counseling resources")
        
        # High bill change
        if input_data.get('Bill_Change_Pct', 0) > 20:
            recommendations.append("Explain bill changes clearly")
            recommendations.append("Offer grandfathered pricing if applicable")
        
        # Electronic check payment
        if input_data.get('Payment_Method_Electronic check', 0) == 1:
            recommendations.append("Encourage automatic payment setup")
            recommendations.append("Offer discount for auto-pay enrollment")
        
        # Support tickets
        if input_data.get('Support_Tickets', 0) > 0:
            recommendations.append("Review support ticket resolution quality")
            recommendations.append("Provide proactive customer service outreach")
        
        # General recommendations based on probability
        if probability > 0.8:
            recommendations.append("Immediate intervention required - assign account manager")
            recommendations.append("Conduct satisfaction survey")
        elif probability > 0.6:
            recommendations.append("Schedule customer success call")
            recommendations.append("Send personalized retention offers")
        elif probability > 0.4:
            recommendations.append("Include in targeted email campaigns")
            recommendations.append("Monitor account activity closely")
        
        if not recommendations:
            recommendations.append("Continue regular customer engagement")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def predict(self, input_data):
        """Make prediction on input data"""
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        # Preprocess input
        X_processed = self.preprocess_input(input_data)
        
        # Make prediction
        prediction = self.model_loader.best_model.predict(X_processed)
        
        # Get probability if available
        try:
            probability = self.model_loader.best_model.predict_proba(X_processed)[:, 1]
        except:
            probability = None
        
        # Get churn reason and recommendations
        churn_reason = self.get_churn_reason(input_data, probability[0] if probability is not None else 0)
        recommendations = self.get_recommendations(input_data, probability[0] if probability is not None else 0)
        
        return {
            'prediction': int(prediction[0]) if len(prediction) == 1 else prediction.tolist(),
            'probability': float(probability[0]) if probability is not None and len(probability) == 1 else probability.tolist() if probability is not None else None,
            'model_used': self.model_loader.best_model_name,
            'model_accuracy': self.model_loader.best_accuracy,
            'churn_reason': churn_reason,
            'recommendations': recommendations
        }
    
    def predict_batch(self, input_data_list):
        """Make predictions on multiple inputs"""
        if not self.is_loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        results = []
        for input_data in input_data_list:
            result = self.predict(input_data)
            results.append(result)
        
        return results
    
    def generate_overview_data(self, predictions_data):
        """Generate overview data for visualization with new dataset structure"""
        total_customers = len(predictions_data)
        
        # Churn risk distribution
        high_risk = sum(1 for p in predictions_data if p['probability'] > 0.7)
        medium_risk = sum(1 for p in predictions_data if 0.4 <= p['probability'] <= 0.7)
        low_risk = sum(1 for p in predictions_data if p['probability'] < 0.4)
        
        # Churn by contract type
        churn_by_contract = {}
        for p in predictions_data:
            contract = "Month-to-month"
            if p.get('Contract_Type_One year', 0) == 1:
                contract = "One year"
            elif p.get('Contract_Type_Two year', 0) == 1:
                contract = "Two year"
            
            if contract not in churn_by_contract:
                churn_by_contract[contract] = 0
            if p['prediction'] == 1:
                churn_by_contract[contract] += 1
        
        # Churn by location
        churn_by_location = {}
        for p in predictions_data:
            location = "Urban"
            if p.get('Location_Rural', 0) == 1:
                location = "Rural"
            elif p.get('Location_Suburban', 0) == 1:
                location = "Suburban"
            
            if location not in churn_by_location:
                churn_by_location[location] = 0
            if p['prediction'] == 1:
                churn_by_location[location] += 1
        
        # Churn by payment method
        churn_by_payment = {}
        for p in predictions_data:
            payment = "Electronic check"
            if p.get('Payment_Method_Bank transfer (auto)', 0) == 1:
                payment = "Bank transfer (auto)"
            elif p.get('Payment_Method_Credit card (auto)', 0) == 1:
                payment = "Credit card (auto)"
            elif p.get('Payment_Method_Mailed check', 0) == 1:
                payment = "Mailed check"
            
            if payment not in churn_by_payment:
                churn_by_payment[payment] = 0
            if p['prediction'] == 1:
                churn_by_payment[payment] += 1
        
        # Average tenure by churn status
        churn_tenures = [p.get('Tenure_Months', 0) for p in predictions_data if p['prediction'] == 1]
        no_churn_tenures = [p.get('Tenure_Months', 0) for p in predictions_data if p['prediction'] == 0]
        
        avg_tenure_churn = sum(churn_tenures) / len(churn_tenures) if churn_tenures else 0
        avg_tenure_no_churn = sum(no_churn_tenures) / len(no_churn_tenures) if no_churn_tenures else 0
        
        # Monthly charges distribution
        monthly_charges = [p.get('Current_Monthly_Bill', 0) for p in predictions_data]
        charges_dist = {
            'min': min(monthly_charges) if monthly_charges else 0,
            'max': max(monthly_charges) if monthly_charges else 0,
            'avg': sum(monthly_charges) / len(monthly_charges) if monthly_charges else 0
        }
        
        return {
            'total_customers': total_customers,
            'churn_risk': {
                'high': high_risk,
                'medium': medium_risk,
                'low': low_risk
            },
            'churn_by_contract': churn_by_contract,
            'churn_by_location': churn_by_location,
            'churn_by_payment_method': churn_by_payment,
            'average_tenure_churn': avg_tenure_churn,
            'average_tenure_no_churn': avg_tenure_no_churn,
            'monthly_charges_distribution': charges_dist
        }
    
    def get_model_info(self):
        """Get information about the loaded model"""
        return self.model_loader.get_model_info()


# Singleton instance for use across the application
_predictor_instance = None


def get_predictor(models_dir=None):
    """Get or create the predictor singleton instance"""
    global _predictor_instance
    
    if _predictor_instance is None:
        if models_dir is None:
            raise ValueError("models_dir must be provided for first initialization")
        _predictor_instance = ChurnPredictor(models_dir)
        _predictor_instance.load_models()
    
    return _predictor_instance
