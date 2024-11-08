# Generated by Django 5.0.7 on 2024-10-10 05:29

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parcel', '0002_parcel_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='parcel',
            name='les_coordonnees_lambert',
            field=models.CharField(default=django.utils.timezone.now, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='parcel',
            name='long_lat',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='parcel',
            name='point_kilometrique',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='parcel',
            name='superficie',
            field=models.PositiveBigIntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='parcel',
            unique_together={('name', 'city')},
        ),
    ]