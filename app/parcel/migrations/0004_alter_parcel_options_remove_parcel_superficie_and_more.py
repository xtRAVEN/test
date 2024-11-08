# Generated by Django 5.0.7 on 2024-10-17 17:15

import django.contrib.gis.db.models.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parcel', '0003_parcel_les_coordonnees_lambert_parcel_long_lat_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='parcel',
            options={'verbose_name': 'Parcel', 'verbose_name_plural': 'Parcels'},
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='superficie',
        ),
        migrations.AlterField(
            model_name='city',
            name='name',
            field=models.CharField(max_length=100, verbose_name='City Name'),
        ),
        migrations.AlterField(
            model_name='city',
            name='province',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cities', to='parcel.province', verbose_name='Province'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='area',
            field=models.IntegerField(verbose_name='Area (sq meters)'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='city',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='parcel.city', verbose_name='City'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='coordinates',
            field=django.contrib.gis.db.models.fields.PolygonField(srid=4326, verbose_name='Coordinates'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Created At'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='land_reference',
            field=models.CharField(max_length=100, verbose_name='Land Reference'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='les_coordonnees_lambert',
            field=models.CharField(max_length=100, verbose_name='Lambert Coordinates'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='long_lat',
            field=models.CharField(max_length=100, verbose_name='Longitude/Latitude'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Parcel Name'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='parcel_type',
            field=models.CharField(max_length=50, verbose_name='Parcel Type'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='point_kilometrique',
            field=models.CharField(max_length=100, verbose_name='Kilometric Point'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='province',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='parcel.province', verbose_name='Province'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='region',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='parcel.region', verbose_name='Region'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='situation',
            field=models.CharField(max_length=200, verbose_name='Situation'),
        ),
        migrations.AlterField(
            model_name='province',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Province Name'),
        ),
        migrations.AlterField(
            model_name='province',
            name='region',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='provinces', to='parcel.region', verbose_name='Region'),
        ),
        migrations.AlterField(
            model_name='region',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Region Name'),
        ),
    ]
