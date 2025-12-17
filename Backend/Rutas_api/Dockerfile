FROM python:3.12-slim

WORKDIR /src

COPY requisitos.txt .
RUN pip install --no-cache-dir -r requisitos.txt

COPY src/ .

EXPOSE 8003

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]