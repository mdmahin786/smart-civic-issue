# CivicWatch Bangalore ML Microservice

This microservice provides AI-powered analysis for civic issues reported in Bangalore.

## Features
- **Issue Classification**: Automatically identifies the category (pothole, garbage, etc.) from text.
- **Priority Prediction**: Predicts urgency (low, medium, high) based on multiple factors.
- **Duplicate Detection**: Uses semantic similarity and geospatial filtering to identify duplicate reports.

## Setup Instructions

### 1. Install Dependencies
Ensure you have Python 3.10+ installed.
```bash
pip install -r requirements.txt
```

### 2. Generate Training Data
Creates 3,500+ synthetic examples with localized Bangalore context.
```bash
python training/generate_data.py
```

### 3. Train Models
Run the training scripts to create the model files in `saved_models/`.
```bash
python training/train_classifier.py
python training/train_priority.py
```

### 4. Start the Service
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `POST /classify`: Get suggested category.
- `POST /predict-priority`: Get suggested priority.
- `POST /detect-duplicate`: Check for similar reports nearby.
- `POST /analyze`: Combined analysis for frontend/backend integration.

## Integration Note
The Node.js backend calls this service at `http://localhost:8000/analyze` whenever a new issue is drafted or submitted.
