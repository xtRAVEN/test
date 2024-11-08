from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import Parcel, Region, Province, City
import json

class ParcelSerializer(serializers.ModelSerializer):
    coordinates = serializers.JSONField()  # Receive coordinates as JSON
    region = serializers.CharField()  # Expect region name
    province = serializers.CharField()  # Expect province name
    city = serializers.CharField()  # Expect city name
    parcel_type = serializers.CharField()  # Allow any string for parcel type

    class Meta:
        model = Parcel
        fields = '__all__'

    def validate_coordinates(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Coordinates must be a valid JSON array.")
        
        if not isinstance(value, list) or len(value) != 2:
            raise serializers.ValidationError("Coordinates must be a list of two numbers [longitude, latitude].")
        
        if not all(isinstance(coord, (int, float)) for coord in value):
            raise serializers.ValidationError("Coordinates must be numbers.")
        
        return value

    def validate_parcel_type(self, value):
        # Allow any string value for parcel_type
        return value

    def validate(self, data):
        # Validate that the related objects exist
        try:
            region = Region.objects.get(name=data['region'])
            province = Province.objects.get(name=data['province'], region=region)
            city = City.objects.get(name=data['city'], province=province)
        except Region.DoesNotExist:
            raise serializers.ValidationError({'region': 'Region does not exist'})
        except Province.DoesNotExist:
            raise serializers.ValidationError({'province': 'Province does not exist or does not belong to the specified region'})
        except City.DoesNotExist:
            raise serializers.ValidationError({'city': 'City does not exist or does not belong to the specified province'})

        data['region'] = region
        data['province'] = province
        data['city'] = city
        return data

    def create(self, validated_data):
        coords = validated_data.pop('coordinates')
        point = Point(coords[0], coords[1])
        validated_data['coordinates'] = point
        return super().create(validated_data)

    def update(self, instance, validated_data):
        coords = validated_data.pop('coordinates', None)
        if coords:
            point = Point(coords[0], coords[1])
            validated_data['coordinates'] = point
        if 'region' in validated_data:
            region = validated_data.pop('region')
            instance.region = Region.objects.get(name=region)
        if 'province' in validated_data:
            province = validated_data.pop('province')
            instance.province = Province.objects.get(name=province, region=instance.region)
        if 'city' in validated_data:
            city = validated_data.pop('city')
            instance.city = City.objects.get(name=city, province=instance.province)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert Point to [longitude, latitude] format
        representation['coordinates'] = [
            instance.coordinates.x,  # longitude
            instance.coordinates.y   # latitude
        ]
        representation['region'] = instance.region.name
        representation['province'] = instance.province.name
        representation['city'] = instance.city.name
        return representation

class ParcelSerializerlist(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)

    class Meta:
        model = Parcel
        fields = [
            'id',
            'parcel_type',
            'name',
            'region_name',
            'province_name',
            'city_name',
            'situation',
            'land_reference',
            'area',
            'point_kilometrique',
        ]

class ParcelSerializerall(serializers.ModelSerializer):
    class Meta:
        model = Parcel
        fields = ['id', 'name']