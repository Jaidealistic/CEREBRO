# CEREBRO: Enterprise Security Intelligence Platform

**CEREBRO** is a next-generation security operations platform designed to augment SOC analysts with real-time AI-driven threat detection. It unifies email analysis, URL reputation checking, and global threat intelligence into a single, cohesive interface.

---

## Core Capabilities

### 1. Email Threat Analysis (NLP Engine)

- **Semantic Anomaly Detection**: Uses advanced Natural Language Processing to analyze email bodies for subtle coercion, urgency, and semantic irregularities often missed by traditional signature-based filters.
- **Explainable AI Integration**: Provides detailed attribution maps utilizing Integrated Gradients to highlight specific words and phrases that triggered the risk score, allowing analysts to understand the rationale behind every flag.

### 2. URL Intelligence Scanner

- **Hybrid Verification**: Combines real-time third-party threat intelligence with a local deep learning model to catch zero-day phishing sites.
- **Heuristic Analysis**: Analyzes URL structure, entropy, and lexical features to detect obfuscation techniques.
- **Forensic Checks**: Performs real-time DNS resolution and SSL certificate validation to assess domain health and legitimacy.

### 3. Live Threat Feed

- **Global Indicators**: Aggregates malicious indicators (IOCs) from authoritative external sources in real-time.
- **Actionable Intelligence**: Provides context on recent campaigns, active malware families, and emerging C2 infrastructure.

### 4. Incident Response & Logging

- **Immutable Audit Trail**: Automatically logs every analysis request, prediction, and confidence score to a local SQLite database.
- **CERT Reporting**: One-click generation of STIX 2.1 compliant reports for sharing intelligence with CERT and external partners.

---

## AI Models and Datasets

### Models

CEREBRO utilizes a specialized multi-model architecture tailored for security tasks:

- **Email Analysis (BERT)**: The email module is powered by a **BERT (Bidirectional Encoder Representations from Transformers)** model. Located in the `email/` directory, this model is fine-tuned to understand the semantic context of email bodies, effectively distinguishing between legitimate communication and social engineering attempts.
- **URL Scanning (DistilBERT)**: The URL module utilizes **DistilBERT**, a lighter and faster distilled version of BERT. Located in the `url/` directory, this model is optimized for real-time inference on URL character sequences, balancing high accuracy with the low-latency requirements of web traffic analysis.

### Datasets and Training Data

The efficacy of CEREBRO's models stems from high-quality, domain-specific datasets used for training:

- **URL Dataset**: The DistilBERT model was trained on the **PhiUSIIL Phishing URL Dataset** (`dataset/PhiUSIIL_Phishing_URL_Dataset.csv`). This comprehensive dataset contains labeled URLs, covering:
  - **Safe URLs**: Legitimate domains from top lists and common business sites.
  - **Phishing URLs**: Verified malicious links targeting various sectors.

- **Email Dataset**: The BERT model was fine-tuned using the **Phishing Email Dataset** (`dataset/phishing_email.csv`). This massive corpus provides a rich variety of:
  - **Safe Emails**: Standard corporate and personal correspondence.
  - **Phishing Emails**: Examples of BEC (Business Email Compromise), spear-phishing, credential harvesting, and urgent-action scams.

- **Real-time Intelligence**: In addition to static training data, the system ingests live threat feeds from **URLHaus**, ensuring protection against zero-day threats not present in the training set.

---

## System Architecture

### Frontend (The Console)

- **Framework**: React 19 (Vite)
- **Design System**: Tailwind CSS v4 with a custom enterprise theme.
- **Visualization**: Framer Motion for smooth state transitions and Lucide React for iconography.

### Backend (The Brain)

- **API**: Python Flask REST API.
- **ML Core**: PyTorch & Transformers for model inference.
- **Interpretability**: Captum library for model explainability (Integrated Gradients).
- **Database**: SQLite (via SQLAlchemy) for lightweight, portable incident logging.

---

## Installation & Setup Guide

### Prerequisites

- **Node.js**: v18 or higher
- **Python**: v3.9 or higher
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Jaidealistic/CEREBRO.git
cd cerebro
```

### 2. Backend Setup

The backend powers the AI models and API authentication.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API Server
python app.py
```

_The server will start on `http://localhost:5000`_

### 3. Frontend Setup

The frontend provides the analyst dashboard.

```bash
cd frontend

# Install Node modules
npm install

# Start the Development Server
npm run dev
```

_The dashboard will be available at `http://localhost:5173` (or similar)_

---

## Usage Instructions

1.  **Launch CEREBRO** by following the setup steps above.
2.  **Select a Module** from the sidebar (Email, URL, Threat Feed, etc.).
3.  **Input Data**:
    - For Email: Paste the email body text.
    - For URL: Enter the suspicious link.
4.  **View Results**: The AI will return a verdict (Safe/Malicious), a confidence score, and explainable highlights.
5.  **Report**: Use the "Notify CERT" button to generate a formal incident report if a threat is confirmed.

---

**CEREBRO Security Systems**
_Augmenting Human Intelligence with Machine Speed._
