from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = Path(__file__).resolve().parent / "model" / "triage_model.joblib"


def generate_training_data(n_samples: int = 5000):
    rng = np.random.default_rng(42)

    ages = rng.integers(1, 90, size=n_samples)
    duration_days = rng.integers(0, 30, size=n_samples)
    chronic = rng.integers(0, 2, size=n_samples)
    pregnant = rng.integers(0, 2, size=n_samples)
    emergency_hit_count = rng.integers(0, 4, size=n_samples)
    text_length = rng.integers(20, 500, size=n_samples)

    features = np.column_stack(
        [ages, duration_days, chronic, pregnant, emergency_hit_count, text_length],
    )

    labels = []
    for age, duration, chronic_flag, pregnant_flag, emergency_hits, _ in features:
        if emergency_hits > 0:
            labels.append(2)  # high
        elif duration > 7 or chronic_flag == 1 or pregnant_flag == 1:
            labels.append(1)  # medium
        elif age > 75 and duration > 3:
            labels.append(1)  # medium
        else:
            labels.append(0)  # low

    return features, np.array(labels)


def main():
    x_train, y_train = generate_training_data()

    model = RandomForestClassifier(n_estimators=120, random_state=42, max_depth=8)
    model.fit(x_train, y_train)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
