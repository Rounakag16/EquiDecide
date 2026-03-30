"""
EquiDecide – Flask API
-----------------------
Single endpoint: POST /api/evaluate

Loads model.pkl once at startup.
Wires the logistic regression baseline with the ODS engine.
Returns the exact response schema agreed with the frontend.

Run from equidecide/ root:
    python backend/app.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from ods_engine import (
    calculate_ods,
    adjust_threshold,
    build_explanation,
    calculate_equity_index,
    calculate_historical_approval_rate,
    BASE_THRESHOLD
)

# ── App setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow React dev server on port 5173

# ── Load model once at startup ─────────────────────────────────────────────────
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    'model', 'model.pkl'
)

try:
    model = pickle.load(open(MODEL_PATH, 'rb'))
    print("Model loaded successfully")
except FileNotFoundError:
    print("model.pkl not found - run scripts/train_model.py first")
    sys.exit(1)


# ── Health check ───────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status"         : "ok",
        "model_loaded"   : True,
        "base_threshold" : BASE_THRESHOLD
    })


# ── Main evaluation endpoint ───────────────────────────────────────────────────
@app.route('/api/evaluate', methods=['POST'])
def evaluate():

    # ── 1. Parse and validate request ─────────────────────────────────────────
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    # Extract fields
    applicant_id = data.get('applicant_id', 'unknown')
    name         = data.get('name', 'Applicant')

    standard  = data.get('standard_metrics', {})
    signals   = data.get('contextual_signals', {})

    academic_score = standard.get('academic_score_percentage')
    monthly_income = standard.get('family_income_monthly_inr')

    # Validate required fields
    if academic_score is None or monthly_income is None:
        return jsonify({
            "error": "Missing required fields: academic_score_percentage, family_income_monthly_inr"
        }), 400

    if not signals.get('location_tier'):
        return jsonify({
            "error": "Missing required field: location_tier"
        }), 400

    # ── 2. Path A — Traditional model ─────────────────────────────────────────
    features  = pd.DataFrame({
        'academic_score_percentage' : [float(academic_score)],
        'family_income_monthly_inr' : [float(monthly_income)]
    })

    prob      = float(model.predict_proba(features)[0][1])
    outcome_a = prob >= BASE_THRESHOLD

    traditional_reason = (
        "Academic score and income meet the required threshold."
        if outcome_a else
        "Academic score and income fall below the required threshold."
    )

    # ── 3. Path B — EquiDecide engine ─────────────────────────────────────────
    ods, reasons  = calculate_ods(signals)
    adj_threshold = adjust_threshold(ods)
    outcome_b     = prob >= adj_threshold

    explanation = build_explanation(
        reasons,
        BASE_THRESHOLD,
        adj_threshold,
        ods,
        name
    )

    # ── 4. Metrics ────────────────────────────────────────────────────────────
    equity     = calculate_equity_index(ods, outcome_a, outcome_b)
    hist_rate  = calculate_historical_approval_rate(
                     signals.get('location_tier', 'Urban'))

    # ── 5. Assemble response ──────────────────────────────────────────────────
    response = {
        "applicant_id" : applicant_id,
        "name"         : name,

        "traditional_model": {
            "outcome"            : "ADMITTED" if outcome_a else "REJECTED",
            "probability_score"  : round(prob, 3),
            "threshold_required" : BASE_THRESHOLD,
            "decision_reason"    : traditional_reason
        },

        "equidecide_model": {
            "outcome"                   : "ADMITTED" if outcome_b else "REJECTED",
            "probability_score"         : round(prob, 3),
            "threshold_required"        : round(adj_threshold, 3),
            "opportunity_deficit_score" : round(ods * 100),
            "context_applied"           : reasons,
            "explanation_text"          : explanation
        },

        "metrics": {
            "equity_index"                  : equity,
            "historical_group_approval_rate": hist_rate
        }
    }

    return jsonify(response), 200


# ── Error handlers ─────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("─" * 45)
    print("  EquiDecide API starting...")
    print("  http://localhost:5000/api/health")
    print("  http://localhost:5000/api/evaluate")
    print("─" * 45)
    app.run(debug=True, port=5000)