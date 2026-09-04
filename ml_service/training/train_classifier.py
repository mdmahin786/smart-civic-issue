import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import sys

# Add root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_preprocessor import preprocess_text, remove_stopwords

def train_category_classifier():
    data_path = 'ml_service/training/data/synthetic_issues.csv'
    if not os.path.exists(data_path):
        print("Data not found. Running generator...")
        from generate_data import generate_synthetic_data
        generate_synthetic_data()

    df = pd.read_csv(data_path)
    
    # Concatenate title and description
    df['text'] = df['title'] + " " + df['description']
    df['text'] = df['text'].apply(preprocess_text).apply(remove_stopwords)

    X = df['text']
    y = df['category']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Pipeline: TF-IDF + LinearSVC
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ('clf', LinearSVC(random_state=42))
    ])

    print("Training Category Classifier...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
    print(classification_report(y_test, y_pred))

    os.makedirs('ml_service/saved_models', exist_ok=True)
    joblib.dump(pipeline, 'ml_service/saved_models/category_classifier.pkl')
    print("Model saved to ml_service/saved_models/category_classifier.pkl")

if __name__ == "__main__":
    train_category_classifier()
