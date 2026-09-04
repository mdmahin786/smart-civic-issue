import joblib
import os
import sys

# Add root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_preprocessor import preprocess_text, remove_stopwords

class CategoryClassifier:
    def __init__(self):
        model_path = 'ml_service/saved_models/category_classifier.pkl'
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = None
            print(f"Warning: Model not found at {model_path}")

    def predict(self, title, description):
        if not self.model:
            return "other", 0.0, {}
        
        text = f"{title} {description}"
        text = preprocess_text(text)
        text = remove_stopwords(text)
        
        prediction = self.model.predict([text])[0]
        
        # Get confidence scores
        decision_scores = self.model.decision_function([text])[0]
        # Softmax-like conversion for confidence
        import numpy as np
        exp_scores = np.exp(decision_scores - np.max(decision_scores))
        probabilities = exp_scores / exp_scores.sum()
        
        classes = self.model.classes_
        conf_scores = {cls: float(score) for cls, score in zip(classes, probabilities)}
        
        return prediction, float(np.max(probabilities)), conf_scores
