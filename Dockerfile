# Use the official lightweight Python image.
FROM python:3.9-slim

# Set a working directory
WORKDIR /app

# Copy requirements first to leverage layer caching
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Streamlit needs this environment variable so it doesn't try to open a browser
ENV STREAMLIT_SERVER_ENABLECORS=false
ENV STREAMLIT_SERVER_HEADLESS=true
ENV PYTHONUNBUFFERED=1

# Expose port 8080 (Cloud Run expects your app to listen on this port)
EXPOSE 8080

# The command to run your Streamlit app
CMD ["streamlit", "run", "app.py", "--server.port", "8080", "--server.address", "0.0.0.0"]
