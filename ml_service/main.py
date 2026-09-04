from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime

# Import models
from models.classifier import CategoryClassifier
from models.priority_predictor import PriorityPredictor
from models.duplicate_detector import DuplicateDetector
from models.image_analyzer import ImageAnalyzer

app = FastAPI(title="CivicWatch Bangalore ML Service")

# Initialize models
classifier = CategoryClassifier()
priority_predictor = PriorityPredictor()
duplicate_detector = DuplicateDetector()
image_analyzer = ImageAnalyzer()

# Schemas
class ImageAnalysisRequest(BaseModel):
    image_path: str

class ClassifyRequest(BaseModel):
    title: str
    description: str

class PriorityRequest(BaseModel):
    category: str
    upvotes: int
    description: str
    has_images: bool
    area: str
    submitted_at: str

class IssueRef(BaseModel):
    id: str
    title: str
    description: str
    lat: float
    lng: float

class DuplicateRequest(BaseModel):
    title: str
    description: str
    lat: float
    lng: float
    existing_issues: List[IssueRef]

class AnalyzeRequest(BaseModel):
    title: str
    description: str
    lat: float
    lng: float
    has_images: bool
    area: str
    existing_issues: List[IssueRef]

@app.get("/health")
def health():
    return {
        "status": "ok",
        "models_loaded": {
            "classifier": classifier.model is not None,
            "priority": priority_predictor.model is not None,
            "duplicate": True # SentenceTransformer loads on init
        }
    }

@app.post("/classify")
async def classify(req: ClassifyRequest):
    category, confidence, all_scores = classifier.predict(req.title, req.description)
    return {
        "category": category,
        "confidence": confidence,
        "all_scores": all_scores
    }

@app.post("/predict-priority")
async def predict_priority(req: PriorityRequest):
    priority, confidence = priority_predictor.predict(
        req.category, req.upvotes, req.description, 
        req.has_images, req.area, req.submitted_at
    )
    return {
        "priority": priority,
        "confidence": confidence
    }

@app.post("/detect-duplicate")
async def detect_duplicate(req: DuplicateRequest):
    issues_list = [i.model_dump() for i in req.existing_issues]
    is_duplicate, confidence, similar_id = duplicate_detector.detect(
        req.title, req.description, req.lat, req.lng, issues_list
    )
    return {
        "is_duplicate": is_duplicate,
        "confidence": confidence,
        "similar_issue_id": similar_id
    }

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    # 1. Classify
    category, cat_conf, _ = classifier.predict(req.title, req.description)
    
    # 2. Priority (using suggested category)
    priority, prio_conf = priority_predictor.predict(
        category, 0, req.description, req.has_images, req.area, datetime.now().isoformat()
    )
    
    # 3. Duplicate
    issues_list = [i.model_dump() for i in req.existing_issues]
    is_dup, dup_conf, similar_id = duplicate_detector.detect(
        req.title, req.description, req.lat, req.lng, issues_list
    )
    
    return {
        "suggested_category": category,
        "category_confidence": cat_conf,
        "suggested_priority": priority,
        "priority_confidence": prio_conf,
        "is_duplicate": is_dup,
        "duplicate_confidence": dup_conf,
        "similar_issue_id": similar_id
    }

@app.post("/analyze-image")
async def analyze_image(req: ImageAnalysisRequest):
    return image_analyzer.analyze(req.image_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

