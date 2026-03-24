from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Vitals(BaseModel):
    heartRate: float
    spo2: float
    gsr: float
    motion: float
    baseline_heart_rate: int = 80
    sensitivity_level: int = 3

@app.post("/predict_stress")
def predict_stress(vitals: Vitals):
    # A simple personalized rule-based fallback for the ML model
    score = 0
    
    # Calculate heart rate elevation over baseline
    hr_elevation = vitals.heartRate - vitals.baseline_heart_rate
    if hr_elevation > 30: score += 40
    elif hr_elevation > 15: score += 20
    
    if vitals.spo2 < 95: score += 20
    if vitals.motion > 0.5: score += 10
    if vitals.gsr > 500: score += 10
    
    # Sensitivity Level multiplier (1-5)
    # E.g. sensitivity 5 means faster to alert
    multiplier = 1.0 + ((vitals.sensitivity_level - 3) * 0.1)
    score = score * multiplier
    
    score = min(100, score)
    
    status = "Normal"
    if score > 75: status = "Emergency"
    elif score > 40: status = "Warning"
    
    return {"stressScore": round(score), "status": status}
