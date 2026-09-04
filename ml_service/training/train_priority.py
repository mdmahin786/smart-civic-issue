import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def train_priority_predictor():
    data_path = 'ml_service/training/data/synthetic_issues.csv'
    df = pd.read_csv(data_path)

    # Preprocessing
    le_category = LabelEncoder()
    le_area = LabelEncoder()
    
    df['category_encoded'] = le_category.fit_transform(df['category'])
    df['area_encoded'] = le_area.fit_transform(df['area'])
    df['desc_len'] = df['description'].str.len()

    X = df[['category_encoded', 'upvotes', 'desc_len', 'has_images', 'area_encoded', 'hour']]
    y = df['priority']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    print("Training Priority Predictor...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
    print(classification_report(y_test, y_pred))

    # Save model and encoders
    model_data = {
        'model': model,
        'le_category': le_category,
        'le_area': le_area
    }
    
    os.makedirs('ml_service/saved_models', exist_ok=True)
    joblib.dump(model_data, 'ml_service/saved_models/priority_model.pkl')
    print("Model saved to ml_service/saved_models/priority_model.pkl")

if __name__ == "__main__":
    train_priority_predictor()
