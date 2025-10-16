FROM python:3.11-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc g++ musl-dev linux-headers

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip && \
    apk del gcc g++ musl-dev linux-headers

COPY . .

EXPOSE $PORT

CMD uvicorn main:app --host 0.0.0.0 --port $PORT