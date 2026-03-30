import pickle
import pandas as pd


def main():
    m = pickle.load(open("model/model.pkl", "rb"))

    candidates = []
    for score in range(50, 81, 2):
        for income in range(1500, 9001, 250):
            X = pd.DataFrame(
                {
                    "academic_score_percentage": [float(score)],
                    "family_income_monthly_inr": [float(income)],
                }
            )
            p = float(m.predict_proba(X)[0][1])
            # If p is between 0.35 and 0.60, high ODS can flip static->dynamic.
            if 0.35 <= p < 0.60:
                candidates.append((abs(p - 0.50), p, score, income))

    candidates.sort()
    print("Top flip-friendly candidates (prob ~0.50):")
    for _, p, score, income in candidates[:15]:
        print(f"score={score:>2} income={income:>5} -> prob={p:.3f}")


if __name__ == "__main__":
    main()

