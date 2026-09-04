import os
import numpy as np
from PIL import Image

class ImageAnalyzer:
    def __init__(self):
        # We can use PyTorch torchvision if available, but fallback gracefully 
        # to PIL-based image analysis if torchvision is not configured or offline.
        self.use_deep_learning = False
        try:
            import torchvision.models as models
            import torchvision.transforms as transforms
            import torch
            
            # Use MobileNet V3 Small for lightweight CPU-friendly inference
            self.model = models.mobilenet_v3_small(pretrained=True)
            self.model.eval()
            
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            self.use_deep_learning = True
            
            # Simple ImageNet class index mappings for civic relevant classes
            # 640: 'manhole cover', 927: 'street sign', 680: 'pothole/ashcan/waste'
            # We map some common classes
            self.civic_classes = {
                'waste': [412, 640, 680, 866, 897, 927],
                'road': [530, 750, 910]
            }
        except Exception as e:
            print(f"Deep learning image vision fallback to heuristic analyzer: {e}")
            self.model = None

    def analyze(self, image_path: str):
        if not os.path.exists(image_path):
            return {"verified": False, "confidence": 0.0, "reason": "File not found", "detected": "none"}

        try:
            img = Image.open(image_path).convert('RGB')
            
            # Heuristic Analysis: color distributions, edge density, and details
            # Potholes: high edge gradient (dark crater details)
            # Garbage: high variance in color distribution
            img_np = np.array(img.resize((100, 100)))
            
            # Extract basic metrics
            std_dev = float(np.std(img_np))
            mean_brightness = float(np.mean(img_np))
            
            # Edge density calculation using simple Sobel-like filter in numpy
            gray = np.mean(img_np, axis=2)
            edge_x = np.diff(gray, axis=1)
            edge_y = np.diff(gray, axis=0)
            edge_density = float(np.mean(np.abs(edge_x)) + np.mean(np.abs(edge_y)))
            
            # Simple classification rules based on image characteristics
            # high std_dev: complex colors (garbage piles/mixed waste)
            # high edge_density + moderate std_dev: textures like asphalt road potholes
            detected_tag = "other"
            confidence = 0.65
            
            if edge_density > 25.0:
                detected_tag = "pothole/damage"
                confidence = min(0.85, 0.5 + (edge_density / 100.0))
            elif std_dev > 45.0:
                detected_tag = "garbage/waste"
                confidence = min(0.80, 0.4 + (std_dev / 100.0))
            else:
                detected_tag = "clean/normal"
                confidence = 0.70

            # If Deep Learning is available, cross-verify
            if self.use_deep_learning and self.model:
                try:
                    import torch
                    tensor = self.transform(img).unsqueeze(0)
                    with torch.no_grad():
                        outputs = self.model(tensor)
                        _, preds = torch.max(outputs, 1)
                        class_idx = int(preds[0])
                        
                        # If model predicts manhole cover, street sign, ashcan, etc.
                        if class_idx in [640, 412, 680, 866]:
                            detected_tag = "garbage/manhole"
                            confidence = 0.85
                except Exception as dl_err:
                    print(f"Deep learning prediction error: {dl_err}")

            # All civic/damage categories are treated as verified reporting images
            is_verified = detected_tag in ["pothole/damage", "garbage/waste", "garbage/manhole"]
            
            return {
                "verified": is_verified,
                "confidence": round(confidence, 2),
                "reason": f"Detected pattern matches {detected_tag}",
                "detected": detected_tag,
                "metrics": {
                    "edge_density": round(edge_density, 2),
                    "variance": round(std_dev, 2),
                    "brightness": round(mean_brightness, 2)
                }
            }
            
        except Exception as e:
            return {"verified": False, "confidence": 0.0, "reason": f"Failed to parse image: {str(e)}", "detected": "none"}
