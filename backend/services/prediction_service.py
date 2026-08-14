import os
from ml.predictor import get_predictor
from typing import Dict, List, Any


class PredictionService:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), '..', 'ml', 'saved_models')
        self.predictor = None
        
    def initialize(self):
        """Initialize the predictor with models"""
        try:
            self.predictor = get_predictor(self.models_dir)
            return True
        except Exception as e:
            print(f"Error initializing prediction service: {e}")
            return False
    
    def predict_churn(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict churn for a single customer
        
        Args:
            customer_data: Dictionary containing customer features
            
        Returns:
            Dictionary with prediction results
        """
        if self.predictor is None:
            if not self.initialize():
                raise RuntimeError("Failed to initialize prediction service")
        
        try:
            result = self.predictor.predict(customer_data)
            return {
                'success': True,
                'data': {
                    'prediction': result['prediction'],
                    'probability': result['probability'],
                    'churn_reason': result.get('churn_reason'),
                    'recommendations': result.get('recommendations'),
                    'model_used': result.get('model_used'),
                    'model_accuracy': result.get('model_accuracy')
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict_batch_churn(self, customers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict churn for multiple customers
        
        Args:
            customers_data: List of dictionaries containing customer features
            
        Returns:
            Dictionary with prediction results for all customers
        """
        if self.predictor is None:
            if not self.initialize():
                raise RuntimeError("Failed to initialize prediction service")
        
        try:
            results = self.predictor.predict_batch(customers_data)
            enhanced_results = []
            for i, result in enumerate(results):
                enhanced_results.append({
                    'original_data': customers_data[i],
                    'prediction': result['prediction'],
                    'probability': result['probability'],
                    'churn_reason': result.get('churn_reason'),
                    'recommendations': result.get('recommendations'),
                    'model_used': result.get('model_used'),
                    'model_accuracy': result.get('model_accuracy')
                })
            
            # Generate overview data
            overview = self.predictor.generate_overview_data(enhanced_results)
            
            return {
                'success': True,
                'data': enhanced_results,
                'count': len(enhanced_results),
                'overview': overview
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model
        
        Returns:
            Dictionary with model information
        """
        if self.predictor is None:
            if not self.initialize():
                raise RuntimeError("Failed to initialize prediction service")
        
        try:
            info = self.predictor.get_model_info()
            return {
                'success': True,
                'data': info
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check if the prediction service is healthy
        
        Returns:
            Dictionary with health status
        """
        if self.predictor is None:
            initialized = self.initialize()
        else:
            initialized = True
        
        return {
            'status': 'healthy' if initialized else 'unhealthy',
            'models_loaded': initialized
        }


# Singleton instance for use across the application
_prediction_service_instance = None


def get_prediction_service():
    """Get or create the prediction service singleton instance"""
    global _prediction_service_instance
    
    if _prediction_service_instance is None:
        _prediction_service_instance = PredictionService()
        _prediction_service_instance.initialize()
    
    return _prediction_service_instance
