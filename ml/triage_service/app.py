from __future__ import annotations

from pathlib import Path
from typing import List

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_PATH = Path(__file__).resolve().parent / "model" / "triage_model.joblib"

EMERGENCY_KEYWORDS = [
    "chest pain",
    "shortness of breath",
    "fainting",
    "seizure",
    "stroke",
    "bleeding",
    "unconscious",
    "suicidal",
    "pregnancy bleeding",
    "severe pain",
    "high fever",
]

SEVERITY_LABELS = ["low", "medium", "high"]


class TriageInput(BaseModel):
    symptomText: str = Field(min_length=10)
    age: int | None = Field(default=None, ge=0, le=120)
    durationDays: int | None = Field(default=None, ge=0, le=365)
    hasChronicConditions: bool = False
    isPregnant: bool = False


class TriageResponse(BaseModel):
    severity: str
    recommendation: str
    redFlags: List[str]
    model: str


class TriageModelService:
    def __init__(self) -> None:
        self.model = None
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)

    def _extract_features(self, payload: TriageInput) -> np.ndarray:
        text = payload.symptomText.lower()
        emergency_hit_count = sum(1 for keyword in EMERGENCY_KEYWORDS if keyword in text)

        features = np.array(
            [
                payload.age or 30,
                payload.durationDays or 0,
                1 if payload.hasChronicConditions else 0,
                1 if payload.isPregnant else 0,
                emergency_hit_count,
                min(len(text), 500),
            ],
            dtype=float,
        )

        return features.reshape(1, -1)

    def _heuristic_label(self, payload: TriageInput) -> str:
        text = payload.symptomText.lower()
        emergency_hits = [keyword for keyword in EMERGENCY_KEYWORDS if keyword in text]

        if emergency_hits:
            return "high"

        if (payload.durationDays or 0) > 7 or payload.hasChronicConditions or payload.isPregnant:
            return "medium"

        return "low"

    def predict(self, payload: TriageInput) -> TriageResponse:
        text = payload.symptomText.lower()
        red_flags = [keyword for keyword in EMERGENCY_KEYWORDS if keyword in text]

        if self.model is not None:
            features = self._extract_features(payload)
            label_index = int(self.model.predict(features)[0])
            severity = SEVERITY_LABELS[label_index]
            model_name = "python-ml-random-forest"
        else:
            severity = self._heuristic_label(payload)
            model_name = "python-heuristic"

        recommendation_by_severity = {
            "low": "Symptoms appear low risk. Continue hydration and monitor for changes. If unresolved in 24-48 hours, schedule a doctor consultation.",
            "medium": "Symptoms require clinician review soon. Schedule teleconsultation within 24 hours and monitor for worsening.",
            "high": "Potentially urgent warning signs detected. Seek immediate in-person medical care or emergency services now.",
        }

        return TriageResponse(
            severity=severity,
            recommendation=recommendation_by_severity[severity],
            redFlags=red_flags,
            model=model_name,
        )


service = TriageModelService()
app = FastAPI(title="YourDoc Triage ML Service", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_loaded": service.model is not None,
    }


@app.post("/triage", response_model=TriageResponse)
def triage(payload: TriageInput) -> TriageResponse:
    return service.predict(payload)
