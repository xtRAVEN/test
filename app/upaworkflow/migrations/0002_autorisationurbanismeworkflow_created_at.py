# Generated by Django 5.0.7 on 2024-10-12 05:07

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upaworkflow', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='autorisationurbanismeworkflow',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
