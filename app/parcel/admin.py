from django.contrib import admin
from .models import Region, Province, City, Parcel
from django.contrib.gis.geos import Point
from django import forms
from dal import autocomplete
import ast
import re

class CoordinatesTextarea(forms.Textarea):
    def format_value(self, value):
        if isinstance(value, Point):
            # Convert the Point coordinates to a string for display
            return f"[{value.x}, {value.y}]"
        return value

class ParcelAdminForm(forms.ModelForm):
    coordinates = forms.CharField(widget=CoordinatesTextarea, required=False)
    
    class Meta:
        model = Parcel
        fields = ['parcel_type', 'name', 'region', 'province', 'city', 'situation', 
                 'land_reference', 'area', 'point_kilometrique', 
                 'les_coordonnees_lambert', 'long_lat', 'coordinates']

        widgets = {
            'province': autocomplete.ModelSelect2(url='province-autocomplete', forward=['region']),
            'city': autocomplete.ModelSelect2(url='city-autocomplete', forward=['province']),
        }
    
    def clean_coordinates(self):
        coordinates = self.cleaned_data.get('coordinates')
        if coordinates:
            try:
                # Remove any unnecessary spaces and ensure the format is correct
                cleaned_coordinates = re.sub(r'\s+', '', coordinates)  # Remove all white spaces
                cleaned_coordinates = f"[{cleaned_coordinates}]"
                
                # Convert the string representation of coordinates to a list
                coords = ast.literal_eval(cleaned_coordinates)
                if not isinstance(coords, list):
                    raise forms.ValidationError("Coordinates must be a list")
                if len(coords) != 2:
                    raise forms.ValidationError("Point must have exactly 2 coordinates")

                # Ensure coordinates are numbers
                if not all(isinstance(x, (int, float)) for x in coords):
                    raise forms.ValidationError("Coordinates must be numbers")

                # Create Point with longitude (x) and latitude (y)
                point = Point(coords[0], coords[1])
                return point
            except (ValueError, SyntaxError) as e:
                raise forms.ValidationError(f"Invalid coordinates format: {str(e)}") from e
        return coordinates

class RegionFilter(admin.SimpleListFilter):
    title = 'Region'
    parameter_name = 'region'

    def lookups(self, request, model_admin):
        regions = Region.objects.all()
        return [(region.id, region.name) for region in regions]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(region_id=self.value())
        return queryset

class ProvinceFilter(admin.SimpleListFilter):
    title = 'Province'
    parameter_name = 'province'

    def lookups(self, request, model_admin):
        provinces = Province.objects.all()
        return [(province.id, province.name) for province in provinces]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(province_id=self.value())
        return queryset

class ParcelAdmin(admin.ModelAdmin):
    form = ParcelAdminForm
    list_display = ['name', 'parcel_type', 'city', 'situation', 'rounded_total_area']
    search_fields = ['name', 'situation']
    list_filter = ['parcel_type', RegionFilter, ProvinceFilter, 'city']

    def rounded_total_area(self, obj):
        return round(float(obj.area), 0) if obj.area else None
    rounded_total_area.short_description = 'Total Area'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

admin.site.register(Parcel, ParcelAdmin)
admin.site.register(Region)
admin.site.register(Province)
admin.site.register(City)