# Generated by Django 5.0.7 on 2024-10-10 10:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foncierworkflow', '0001_initial'),
        ('parcel', '0003_parcel_les_coordonnees_lambert_parcel_long_lat_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='foncierworkflow',
            name='parcel',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='foncier', to='parcel.parcel', verbose_name='Parcel'),
        ),
    ]
