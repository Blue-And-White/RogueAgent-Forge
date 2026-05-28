FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p notes scripts

COPY . .
# Ensure the default script exists and is executable
RUN echo "echo 'Backup completed successfully'" > scripts/backup.sh && chmod +x scripts/backup.sh

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8020"]
