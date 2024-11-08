FROM python:3.11
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    postgis \
    binutils \
    libproj-dev \
    gdal-bin \
    gettext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory and copy only requirements first for caching
WORKDIR /app
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ./app /app/

# Expose port 8000 for the Django application
EXPOSE 8000

# Run migrations, collect static files, and start Gunicorn server
CMD python manage.py migrate && \
    python manage.py import_data && \
    python manage.py collectstatic --noinput && \
    gunicorn patrimonya.wsgi:application --bind 0.0.0.0:8000 --workers 3

