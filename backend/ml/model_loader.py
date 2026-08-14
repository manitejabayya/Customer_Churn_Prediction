import joblib
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from preprocessing import DataPreprocessor


class ModelLoader:
    def __init__(self, models_dir):
        self.models_dir = models_dir
        self.preprocessor = DataPreprocessor()
        self.best_model = None
        self.best_model_name = None
        self.best_accuracy = None
        self.models_loaded = False
        
    def load_preprocessor(self):
        """Load the preprocessor objects"""
        preprocessor_path = os.path.join(self.models_dir, 'preprocessor.pkl')
        if os.path.exists(preprocessor_path):
            self.preprocessor.load_preprocessor(preprocessor_path)
            print("Preprocessor loaded successfully")
            return True
        else:
            print(f"Preprocessor not found at {preprocessor_path}")
            return False
    
    def load_best_model(self):
        """Load the best performing model"""
        model_path = os.path.join(self.models_dir, 'best_model.pkl')
        metadata_path = os.path.join(self.models_dir, 'model_metadata.pkl')
        
        if os.path.exists(model_path):
            self.best_model = joblib.load(model_path)
            print("Best model loaded successfully")
            
            # Load metadata
            if os.path.exists(metadata_path):
                metadata = joblib.load(metadata_path)
                self.best_model_name = metadata.get('best_model_name')
                self.best_accuracy = metadata.get('best_accuracy')
                print(f"Best model: {self.best_model_name} with accuracy: {self.best_accuracy:.4f}")
            
            return True
        else:
            print(f"Best model not found at {model_path}")
            return False
    
    def load_specific_model(self, model_name):
        """Load a specific model by name"""
        if model_name == 'LogisticRegression':
            model_path = os.path.join(self.models_dir, 'logistic_regression_model.pkl')
        elif model_name == 'XGBoost':
            model_path = os.path.join(self.models_dir, 'xgboost_model.pkl')
        else:
            print(f"Unknown model name: {model_name}")
            return None
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print(f"{model_name} model loaded successfully")
            return model
        else:
            print(f"Model not found at {model_path}")
            return None
    
    def load_all(self):
        """Load preprocessor and best model"""
        preprocessor_loaded = self.load_preprocessor()
        model_loaded = self.load_best_model()
        
        self.models_loaded = preprocessor_loaded and model_loaded
        
        if self.models_loaded:
            print("All models and preprocessor loaded successfully")
        else:
            print("Failed to load some components")
        
        return self.models_loaded
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if not self.models_loaded:
            return None
        
        return {
            'model_name': self.best_model_name,
            'accuracy': self.best_accuracy,
            'feature_columns': self.preprocessor.feature_columns
        }
