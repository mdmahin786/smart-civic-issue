import joblib
import os
import numpy as np
from datetime import datetime

class PriorityPredictor:
    def __init__(self):
        model_path = 'ml_service/saved_models/priority_model.pkl'
        if os.path.exists(model_path):
            data = joblib.load(model_path)
            self.model = data['model']
            self.le_category = data['le_category']
            self.le_area = data['le_area']
        else:
            self.model = None
            print(f"Warning: Model not found at {model_path}")

    def predict(self, category, upvotes, description, has_images, area, submitted_at):
        if not self.model:
            return "medium", 0.0

        try:
            # Feature extraction
            cat_idx = self.le_category.transform([category])[0] if category in self.le_category.classes_ else 0
            area_idx = self.le_area.transform([area])[0] if area in self.le_area.classes_ else 0
            desc_len = len(description)
            
            # Parse hour
            dt = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
            hour = dt.hour
            
            features = np.array([[cat_idx, upvotes, desc_len, int(has_images), area_idx, hour]])
            
            probs = self.model.predict_proba(features)[0]
            prediction = self.model.classes_[np.argmax(probs)]
            confidence = float(np.max(probs))
            
            # Business Rules Overrides
            if upvotes >= 10 and prediction == "low":
                prediction = "medium"
            
            if (category in ["pothole", "water_leakage"]) and upvotes >= 5:
                prediction = "high"
            
            return prediction, confidence
            
        except Exception as e:
            print(f"Priority prediction error: {e}")
            return "medium", 0.5
