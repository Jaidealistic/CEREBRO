
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import model_utils
import torch
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'incident_logs.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model
class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    target = db.Column(db.String(500), nullable=False)
    prediction = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "target": self.target,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }

# Initialize Database
with app.app_context():
    db.create_all()

# Load Models
PROJECT_ROOT = os.path.dirname(BASE_DIR)
EMAIL_MODEL_PATH = os.path.join(PROJECT_ROOT, "email")
URL_MODEL_PATH = os.path.join(PROJECT_ROOT, "url")

print(f"Loading Email Model from {EMAIL_MODEL_PATH}...")
email_model, email_tokenizer = model_utils.load_model(EMAIL_MODEL_PATH)

print(f"Loading URL Model from {URL_MODEL_PATH}...")
url_model, url_tokenizer = model_utils.load_model(URL_MODEL_PATH)


@app.route('/api/analyze/email', methods=['POST'])
def analyze_email():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    if not email_model:
         return jsonify({"error": "Email model not loaded"}), 500

    try:
        # Predict
        pred_idx, confidence, _ = model_utils.predict(text, email_model, email_tokenizer)
        label = "Spam" if pred_idx == 1 else "Legitimate" 
        
        # Explain
        attributions, _ = model_utils.explain_prediction(text, email_model, email_tokenizer, target_class=pred_idx)
        
        result = {
            "prediction": label,
            "confidence": confidence,
            "attributions": attributions
        }
        
        # Log Incident to DB
        new_incident = Incident(
            type="Email Analysis",
            target=text[:50] + "..." if len(text) > 50 else text,
            prediction=label,
            confidence=confidence
        )
        db.session.add(new_incident)
        db.session.commit()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from threat_intel import threat_intel

@app.route('/api/analyze/url', methods=['POST'])
def analyze_url():
    data = request.json
    url = data.get('url', '')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if not url_model:
         return jsonify({"error": "URL model not loaded"}), 500

    try:
        # 1. Threat Intelligence Check
        ti_result = threat_intel.check_url(url)
        
        # 2. Model Prediction
        pred_idx, confidence, _ = model_utils.predict(url, url_model, url_tokenizer)
        
        model_label = "Phishing" if pred_idx == 0 else "Safe"
        
        # 3. Hybrid Decision Logic
        final_label = model_label
        final_confidence = confidence

        if ti_result['status'] == 'Malicious':
            final_label = "Phishing"
            final_confidence = 0.99 
        elif ti_result['status'] == 'Clean' and ti_result['source'] == 'Allowed List':
            final_label = "Safe"
            final_confidence = 0.99
        else:
             final_label = model_label
             final_confidence = confidence
        
        # Explain
        attributions, _ = model_utils.explain_prediction(url, url_model, url_tokenizer, target_class=pred_idx)
        
        result = {
            "prediction": final_label,
            "confidence": final_confidence,
            "attributions": attributions,
            "third_party_analysis": ti_result,
            "raw_model_prediction": model_label
        }

        # Log Incident to DB
        new_incident = Incident(
            type="URL Scan",
            target=url,
            prediction=final_label,
            confidence=final_confidence
        )
        db.session.add(new_incident)
        db.session.commit()

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notify-cert', methods=['POST'])
def notify_cert():
    data = request.json
    threat_type = data.get('type')
    content = data.get('content')
    
    # Generate STIX Bundle
    stix_bundle = threat_intel.generate_stix_report(threat_type, content)
    
    # Save to disk (Simulating submission to SOC)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.json"
    filepath = os.path.join(BASE_DIR, 'submitted_reports', filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, 'w') as f:
        json.dump(stix_bundle, f, indent=4)

    print(f"\n[CERT] STIX Bundle saved to {filepath}")
    
    return jsonify({
        "status": "reported", 
        "message": "CERT notified successfully. STIX 2.1 Object generated.",
        "report_id": f"STIX-{timestamp}",
        "file_saved": filename,
        "stix_data": stix_bundle
    })

@app.route('/api/incident-logs', methods=['GET'])
def get_incident_logs():
    # Fetch from DB (descending order)
    incidents = Incident.query.order_by(Incident.timestamp.desc()).all()
    return jsonify([i.to_dict() for i in incidents])

@app.route('/api/threat-feed', methods=['GET'])
def get_threat_feed():
    try:
        threats = threat_intel.get_recent_threats(limit=50)
        return jsonify(threats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)
