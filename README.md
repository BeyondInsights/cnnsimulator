# CNN Subscription Simulator

This repository contains a Streamlit-based web app that replicates the CNN Subscription Simulator UI and hooks into a sample Excel backend.

## Repository Structure

```
cnn-simulator/
├── app.py
├── simulator_backend.py
├── requirements.txt
├── Dockerfile
├── app.yaml
├── README.md
└── assets/
    ├── custom.css
    └── logo.png   # Replace this with your CNN logo
```

## Getting Started

### Prerequisites

- Python 3.8+ installed
- `pip` package manager

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/YourUsername/cnn-simulator.git
   cd cnn-simulator
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Streamlit app:
   ```bash
   streamlit run app.py
   ```
   Open your browser at `http://localhost:8501`.

### Deploy to Google Cloud Run

1. Build the Docker image:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/cnn-simulator
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy cnn-simulator \
     --image gcr.io/PROJECT_ID/cnn-simulator \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi
   ```
   Replace `PROJECT_ID` with your Google Cloud project ID. After deployment, you'll receive a URL to access the app.

### Deploy to App Engine

1. Enable the App Engine API:
   ```bash
   gcloud services enable appengine.googleapis.com
   ```

2. Create an App Engine application (if not already created):
   ```bash
   gcloud app create --region=us-central
   ```

3. Deploy:
   ```bash
   gcloud app deploy app.yaml
   ```
   After deployment, you'll receive a URL under `PROJECT_ID.uc.r.appspot.com`.

---

Feel free to customize the styling in `assets/custom.css` and replace `assets/logo.png` with your official logo.
