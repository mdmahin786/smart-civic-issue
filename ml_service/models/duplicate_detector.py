from sentence_transformers import SentenceTransformer, util
import numpy as np
import math

class DuplicateDetector:
    def __init__(self):
        # Using a small, efficient model for sentence embeddings
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

    def haversine(self, lat1, lon1, lat2, lon2):
        # Distance between two points on earth in meters
        R = 6371000 # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        
        a = math.sin(dphi / 2)**2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def detect(self, title, description, lat, lng, existing_issues):
        if not existing_issues:
            return False, 0.0, None

        # 1. Filter by location (within 500m)
        candidates = []
        for issue in existing_issues:
            dist = self.haversine(lat, lng, issue['lat'], issue['lng'])
            if dist <= 500:
                candidates.append(issue)
        
        if not candidates:
            return False, 0.0, None

        # 2. Semantic Similarity
        new_text = f"{title} {description}"
        existing_texts = [f"{i['title']} {i['description']}" for i in candidates]
        
        embeddings1 = self.model.encode(new_text, convert_to_tensor=True)
        embeddings2 = self.model.encode(existing_texts, convert_to_tensor=True)
        
        cosine_scores = util.cos_sim(embeddings1, embeddings2)[0]
        max_idx = np.argmax(cosine_scores.cpu().numpy())
        max_score = float(cosine_scores[max_idx])
        
        if max_score >= 0.75:
            return True, max_score, candidates[max_idx]['id']
            
        return False, max_score, None
