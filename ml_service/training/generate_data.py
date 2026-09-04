import pandas as pd
import random
import os

def generate_synthetic_data():
    categories = {
        "pothole": [
            "huge pothole on road", "damaged road near metro station", "gunda on main road", 
            "deep hole in middle of street", "cracked pavement making it hard to drive",
            "potholes everywhere on this stretch", "dangerous crater on silk board flyover",
            "road condition is very bad, gunda blocking traffic", "many potholes after rain",
            "vehicle damage due to deep gunda on outer ring road"
        ],
        "garbage": [
            "garbage not collected for many days", "bin overflow near apartment", "kachra pileup in corner",
            "smell coming from garbage dump", "waste scattered on sidewalk", "garbage collection truck not coming",
            "illegal dumping of waste near lake", "public bin is full and kachra is spilling",
            "uncollected waste attracting dogs", "community garbage area needs cleaning"
        ],
        "water_leakage": [
            "pipeline burst on street", "water wasting from broken pipe near park", "pani leaking from main pipe",
            "water supply pipe broken", "drinking water overflowing on road", "leakage in underground water line",
            "large amount of water being wasted due to pipe crack", "pani leakage near metro pillar",
            "BWSSB pipe burst in my area", "water coming out from road surface"
        ],
        "streetlight": [
            "streetlight not working since week", "dark road at night, no lights", "light kamba not working",
            "bulb fused in streetlight", "unsafe area at night due to no streetlights", 
            "flickering light on main road", "entire block has no streetlights", "kamba broken in recent rain",
            "night time visibility is zero on this street", "dangerous for women at night due to dark kamba"
        ],
        "sewage": [
            "sewage overflow on road", "manhole uncovered, very bad smell", "drainage water blocking path",
            "gutter water coming into house", "sewer line choked", "toxic smell from open drainage",
            "manhole lid is broken", "stagnant sewage water on street", "overflowing drains near hospital",
            "underground drainage system failed"
        ],
        "park": [
            "park bench is broken", "garden not maintained, plants dying", "park lights not working",
            "jogging track is damaged", "play area for kids is broken", "weed overgrowth in public park",
            "fountain not working for months", "garbage inside the garden area", 
            "park gate is broken", "illegal activities in park due to no security"
        ],
        "other": [
            "stray dogs problem", "illegal parking blocking road", "noise pollution from construction",
            "illegal billboard on tree", "encroachment of footpath", "unauthorized vendor on main road",
            "rabid dog seen in area", "construction debris dumped on road", 
            "loud speakers at night", "encroachment of public land"
        ]
    }

    areas = ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "MG Road", "HSR Layout", "Malleshwaram"]
    data = []

    for category, phrases in categories.items():
        for _ in range(500):
            phrase = random.choice(phrases)
            # Add some variability
            area = random.choice(areas)
            title = f"{category.capitalize()} issue in {area}"
            description = f"{phrase}. This is happening in {area} near the landmark."
            
            # Synthetic features for priority
            upvotes = random.randint(0, 50)
            has_images = random.choice([0, 1])
            hour = random.randint(0, 23)
            
            # Simple priority logic for synthetic data
            priority = "medium"
            if category in ["pothole", "water_leakage"] and upvotes > 10:
                priority = "high"
            elif upvotes > 25:
                priority = "high"
            elif upvotes < 5 and category not in ["sewage", "pothole"]:
                priority = "low"

            data.append({
                "category": category,
                "title": title,
                "description": description,
                "upvotes": upvotes,
                "has_images": has_images,
                "hour": hour,
                "area": area,
                "priority": priority
            })

    df = pd.DataFrame(data)
    os.makedirs('ml_service/training/data', exist_ok=True)
    df.to_csv('ml_service/training/data/synthetic_issues.csv', index=False)
    print(f"Generated {len(df)} examples at ml_service/training/data/synthetic_issues.csv")

if __name__ == "__main__":
    generate_synthetic_data()
