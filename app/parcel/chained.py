from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from parcel.models import Region, Province, City
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

class ProvinceList(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        region_id = request.data.get('region')
        if not region_id:
            return JsonResponse({'error': 'Region ID is required'}, status=400)

        try:
            region = Region.objects.get(id=region_id)
        except Region.DoesNotExist:
            raise NotFound('Region not found')

        provinces = region.provinces.all()
        province_data = {p.name: p.id for p in provinces}
        return JsonResponse(data=province_data, safe=False)

class CityList(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        province_id = request.data.get('province')
        if not province_id:
            return JsonResponse({'error': 'Province ID is required'}, status=400)

        try:
            province = Province.objects.get(id=province_id)
        except Province.DoesNotExist:
            raise NotFound('Province not found')

        cities = province.cities.all()
        city_data = {c.name: c.id for c in cities}
        return JsonResponse(data=city_data, safe=False)
