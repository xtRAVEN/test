# create_superuser.py
import os
from django.contrib.auth import get_user_model
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patrimonya.settings")
django.setup()

User = get_user_model()

# Set hard-coded values for the superuser details
USERNAME = "admin"
EMAIL = "admin@example.com"
PASSWORD = "password123"  # Replace with a secure password

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print("Superuser created")
else:
    print("Superuser already exists")

