import pandas as pd
import numpy as np
from model_loader import ModelLoader


class ChurnPredictor:
    def __init__(self, models_dir):
        self.model_loader = ModelLoader(models_dir)
        self.is_loaded = False
        
    def load_models(self):
        """Load the preprocessor and best model"""
        self.is_loaded = self.model_loader.load_all()
        return self.is_loaded
    
    def preprocess_input(self, input_data):
        """Preprocess input data for prediction"""
        # Convert input to DataFrame if it's a dictionary
        if isinstance(input_data, dict):
            input_data = [input_data]
        
        df = pd.DataFrame(input_data)
        
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
        """Determine the primary reason for churn based on features"""
        reasons = []
        
        # Check for high monthly charges
        if input_data.get('MonthlyCharges', 0) > 80:
            reasons.append("High monthly charges")
        
        # Check for short tenure
        if input_data.get('tenure', 0) < 12:
            reasons.append("Short customer tenure (less than 1 year)")
        
        # Check for month-to-month contract
        if input_data.get('Contract_One year', 0) == 0 and input_data.get('Contract_Two year', 0) == 0:
            reasons.append("Month-to-month contract (no long-term commitment)")
        
        # Check for fiber optic internet
        if input_data.get('InternetService_Fiber optic', 1) == 1:
            reasons.append("Fiber optic internet service")
        
        # Check for lack of tech support
        if input_data.get('TechSupport', 0) == 0:
            reasons.append("No technical support")
        
        # Check for electronic check payment
        if input_data.get('PaymentMethod_Electronic check', 0) == 1:
            reasons.append("Electronic check payment method")
        
        # Check for paperless billing
        if input_data.get('PaperlessBilling', 0) == 1:
            reasons.append("Paperless billing")
        
        # Check for no online security
        if input_data.get('OnlineSecurity', 0) == 0:
            reasons.append("No online security")
        
        if not reasons:
            reasons.append("Multiple factors contributing to churn risk")
        
        return reasons[0] if reasons else "General churn risk factors"
    
    def get_recommendations(self, input_data, probability):
        """Generate recommendations to reduce churn risk"""
        recommendations = []
        
        # High monthly charges
        if input_data.get('MonthlyCharges', 0) > 80:
            recommendations.append("Offer discount or promotional pricing")
            recommendations.append("Review current plan and suggest cost optimization")
        
        # Short tenure
        if input_data.get('tenure', 0) < 12:
            recommendations.append("Offer onboarding support and training")
            recommendations.append("Provide early-bird renewal incentives")
        
        # Month-to-month contract
        if input_data.get('Contract_One year', 0) == 0 and input_data.get('Contract_Two year', 0) == 0:
            recommendations.append("Offer incentives for long-term contract")
            recommendations.append("Highlight benefits of annual plans")
        
        # No tech support
        if input_data.get('TechSupport', 0) == 0:
            recommendations.append("Offer free technical support trial")
            recommendations.append("Proactive customer service outreach")
        
        # No online security
        if input_data.get('OnlineSecurity', 0) == 0:
            recommendations.append("Promote cybersecurity add-ons")
            recommendations.append("Educate on security benefits")
        
        # Fiber optic issues
        if input_data.get('InternetService_Fiber optic', 1) == 1:
            recommendations.append("Review service quality and satisfaction")
            recommendations.append("Offer service upgrade or optimization")
        
        # Electronic check payment
        if input_data.get('PaymentMethod_Electronic check', 0) == 1:
            recommendations.append("Encourage automatic payment setup")
            recommendations.append("Offer discount for auto-pay enrollment")
        
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
        """Generate overview data for visualization"""
        total_customers = len(predictions_data)
        
        # Churn risk distribution
        high_risk = sum(1 for p in predictions_data if p['probability'] > 0.7)
        medium_risk = sum(1 for p in predictions_data if 0.4 <= p['probability'] <= 0.7)
        low_risk = sum(1 for p in predictions_data if p['probability'] < 0.4)
        
        # Churn by contract type
        churn_by_contract = {}
        for p in predictions_data:
            contract = "Month-to-month"
            if p.get('Contract_One year', 0) == 1:
                contract = "One year"
            elif p.get('Contract_Two year', 0) == 1:
                contract = "Two year"
            
            if contract not in churn_by_contract:
                churn_by_contract[contract] = 0
            if p['prediction'] == 1:
                churn_by_contract[contract] += 1
        
        # Churn by internet service
        churn_by_internet = {}
        for p in predictions_data:
            internet = "DSL"
            if p.get('InternetService_Fiber optic', 0) == 1:
                internet = "Fiber optic"
            elif p.get('InternetService_No', 0) == 1:
                internet = "No"
            
            if internet not in churn_by_internet:
                churn_by_internet[internet] = 0
            if p['prediction'] == 1:
                churn_by_internet[internet] += 1
        
        # Churn by payment method
        churn_by_payment = {}
        for p in predictions_data:
            payment = "Mailed check"
            if p.get('PaymentMethod_Electronic check', 0) == 1:
                payment = "Electronic check"
            elif p.get('PaymentMethod_Credit card (automatic)', 0) == 1:
                payment = "Credit card (automatic)"
            
            if payment not in churn_by_payment:
                churn_by_payment[payment] = 0
            if p['prediction'] == 1:
                churn_by_payment[payment] += 1
        
        # Average tenure by churn status
        churn_tenures = [p.get('tenure', 0) for p in predictions_data if p['prediction'] == 1]
        no_churn_tenures = [p.get('tenure', 0) for p in predictions_data if p['prediction'] == 0]
        
        avg_tenure_churn = sum(churn_tenures) / len(churn_tenures) if churn_tenures else 0
        avg_tenure_no_churn = sum(no_churn_tenures) / len(no_churn_tenures) if no_churn_tenures else 0
        
        # Monthly charges distribution
        monthly_charges = [p.get('MonthlyCharges', 0) for p in predictions_data]
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
            'churn_by_internet_service': churn_by_internet,
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
