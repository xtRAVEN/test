from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _  # Importing gettext_lazy for translation

class Region(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("Region Name"))

    def __str__(self):
        return self.name

class Province(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("Province Name"))
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='provinces', verbose_name=_("Region"))

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("City Name"))
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='cities', verbose_name=_("Province"))

    def __str__(self):
        return self.name

class Parcel(models.Model):
    parcel_type = models.CharField(max_length=50, verbose_name=_("Parcel Type"))
    name = models.CharField(max_length=100, verbose_name=_("Parcel Name"))
    region = models.ForeignKey('Region', on_delete=models.CASCADE, verbose_name=_("Region"))
    province = models.ForeignKey('Province', on_delete=models.CASCADE, verbose_name=_("Province"))
    city = models.ForeignKey('City', on_delete=models.CASCADE, verbose_name=_("City"))
    situation = models.CharField(max_length=200, verbose_name=_("Situation"))
    land_reference = models.CharField(max_length=100, verbose_name=_("Land Reference"))
    area = models.IntegerField(verbose_name=_("Area (sq meters)"))
    # superficie = models.PositiveBigIntegerField(verbose_name=_("Superficie (in sq meters)"))
    point_kilometrique = models.CharField(max_length=100, verbose_name=_("Kilometric Point"))
    les_coordonnees_lambert = models.CharField(max_length=100, verbose_name=_("Lambert Coordinates"))
    long_lat = models.CharField(max_length=100, verbose_name=_("Longitude/Latitude"))
    coordinates = models.PointField(verbose_name=_("Coordinates"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        unique_together = ('name', 'city')
        verbose_name = _("Parcel")
        verbose_name_plural = _("Parcels")

    def __str__(self):
        return self.name
