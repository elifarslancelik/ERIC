# Resmi Python imajını kullan (Hugging Face Spaces ile uyumlu)
FROM python:3.10-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm proje dosyalarını kopyala
COPY . .

# Hugging Face Spaces için gerekli port
EXPOSE 7860

# Production-ready WSGI sunucusu ile başlat
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "600", "app:app"]