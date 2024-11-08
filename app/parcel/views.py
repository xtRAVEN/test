from datetime import date, datetime
from decimal import Decimal
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.utils import timezone
from django.core.serializers import serialize
import json
# Create your views here.
from dal import autocomplete
from .models import Province, City,Parcel, Region
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import ParcelSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication  
from rest_framework import viewsets
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
from .serializer import ParcelSerializerlist,ParcelSerializerall
from rest_framework.exceptions import NotFound
from django.db.models import Q
from combustibleworkflow.models import CombustibleWorkflow
from foncierworkflow.models import FoncierWorkflow
from occupationtempworkflow.models import OccupationWorkflow
from upaworkflow.models import AutorisationUrbanismeWorkflow
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class ProvinceAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Province.objects.none()

        qs = Province.objects.all()

        region = self.forwarded.get('region', None)

        if region:
            qs = qs.filter(region_id=region)

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs

class CityAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return City.objects.none()

        qs = City.objects.all()

        province = self.forwarded.get('province', None)

        if province:
            qs = qs.filter(province_id=province)

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs






# views.py

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .models import Province, City
# from django.contrib.auth import authenticate
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework import status



# class ProvinceByRegionView(APIView):
#     def get(self, request, region_id, *args, **kwargs):
#         provinces = Province.objects.filter(region_id=region_id).values('id', 'name')
#         return Response(provinces)

# class CityByProvinceView(APIView):
#     def get(self, request, province_id, *args, **kwargs):
#         cities = City.objects.filter(province_id=province_id).values('id', 'name')
#         return Response(cities)



# class CustomLoginView(APIView):

#     def post(self,request,*args,**kwargs):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(username=username,password=password)
#         if user:
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh)
#             },status = status.HTTP_200_OK)
        
#         else:
#             return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)




class ParcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        if parcel_id:
            try:
                parcel = Parcel.objects.get(pk=parcel_id)
                serializer = ParcelSerializer(parcel)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Parcel.DoesNotExist:
                raise NotFound(detail="Parcel not found.")
        else:
            parcels = Parcel.objects.all()
            serializer = ParcelSerializer(parcels, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = ParcelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        try:
            parcel = Parcel.objects.get(pk=parcel_id)
        except Parcel.DoesNotExist:
            raise NotFound(detail="Parcel not found.")
        serializer = ParcelSerializer(parcel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        try:
            parcel = Parcel.objects.get(pk=parcel_id)
        except Parcel.DoesNotExist:
            raise NotFound(detail="Parcel not found.")
        parcel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




from rest_framework.decorators import api_view
from .models import Region, Province, City

@api_view(['GET'])
def get_locations(request):
    regions = Region.objects.values('id', 'name')
    provinces = Province.objects.values('id', 'name', 'region_id')
    cities = City.objects.values('id', 'name', 'province_id')
    
    return Response({
        'regions': list(regions),
        'provinces': list(provinces),
        'cities': list(cities)
    })




from rest_framework.decorators import action

class ParcelPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ParcelViewSet(viewsets.ModelViewSet):
    queryset = Parcel.objects.all()
    serializer_class = ParcelSerializerlist
    pagination_class = ParcelPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['name']
    search_fields = ['name', 'region__name', 'province__name', 'city__name', 'situation', 'land_reference']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(region__name__icontains=search_query) |
                Q(province__name__icontains=search_query) |
                Q(city__name__icontains=search_query) |
                Q(situation__icontains=search_query) |
                Q(land_reference__icontains=search_query)
            )

        # Filter by parcel_type
        parcel_type = self.request.query_params.get('parcel_type', None)
        if parcel_type:
            queryset = queryset.filter(parcel_type=parcel_type)

        # Filter by region
        region = self.request.query_params.get('region', None)
        if region:
            queryset = queryset.filter(region__name=region)

        # Filter by province
        province = self.request.query_params.get('province', None)
        if province:
            queryset = queryset.filter(province__name=province)

        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__name=city)

        return queryset

    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all parcel types"""
        types = dict(Parcel.PARCEL_TYPE_CHOICES)
        data = [{'value': key, 'label': value} for key, value in types.items()]
        return Response(data)

    @action(detail=False, methods=['get'])
    def regions(self, request):
        """Get all regions"""
        regions = Region.objects.values('id', 'name')
        return Response(regions)

    @action(detail=False, methods=['get'])
    def provinces(self, request):
        """Get all provinces"""
        provinces = Province.objects.values('id', 'name')
        return Response(provinces)

    @action(detail=False, methods=['get'])
    def cities(self, request):
        """Get all cities"""
        cities = City.objects.values('id', 'name')
        return Response(cities)



class ParcelListView(APIView):
    def get(self, request):
        parcels = Parcel.objects.all()
        serializer = ParcelSerializerall(parcels, many=True)
        return Response(serializer.data)



from django.views import View
from django.http import JsonResponse
from django.db.models import Count, Sum, Q
from django.utils import timezone
import json




class ParcelDashboardView(View):
    def get(self, request):
        # Get filter parameters
        parcel_type = request.GET.get('parcelType', 'all')
        workflow_status = request.GET.get('workflowStatus', 'all')
        time_range = request.GET.get('timeRange', 'all')
        region_id = request.GET.get('region', 'all')
        province_id = request.GET.get('province', 'all')
        city_id = request.GET.get('city', 'all')

        # Base queryset for parcel types
        all_parcels = Parcel.objects.select_related('region', 'province', 'city', 'foncier').prefetch_related(
            'combustiblework', 'occupationwork', 'upawork'
        ).all()

        # Apply filters
        all_parcels = self.apply_filters(all_parcels, parcel_type, region_id, province_id, city_id)

        # Get all unique parcel types, including custom ones
        all_parcel_types = set(Parcel.objects.values_list('parcel_type', flat=True).distinct())
        
        # Predefined parcel types
        predefined_types = {'bare land', 'service station', 'building', 'warehouse', 'fishing supply point'}
        
        # Separate custom types from predefined types
        custom_types = all_parcel_types - predefined_types

        # Calculate parcel type counts
        parcel_types = all_parcels.values('parcel_type').annotate(count=Count('id'))
        parcel_types = list(parcel_types)
        
        # Add custom types to parcel_types
        for custom_type in custom_types:
            count = all_parcels.filter(parcel_type=custom_type).count()
            parcel_types.append({'parcel_type': custom_type, 'count': count})

        total_area = all_parcels.aggregate(Sum('area'))['area__sum'] or 0

        # Now apply workflow status filter for other data
        parcels = all_parcels
        workflow_filter = self.get_workflow_filter(workflow_status)
        if workflow_filter:
            parcels = parcels.filter(workflow_filter)

        # Apply time range filter
        parcels = self.apply_time_range_filter(parcels, time_range)

        # Get workflow status data
        workflow_status_data = self.get_workflow_status_data(parcels, workflow_status)

        # Get location data
        location_data = self.get_location_data(all_parcels)

        # Serialize parcel data
        parcel_data = self.serialize_parcel_data(parcels, workflow_status)

        data = {
            'parcels': parcel_data,
            'parcel_types': parcel_types,
            'custom_parcel_types': list(custom_types),
            'total_area': total_area,
            'workflow_status': workflow_status_data,
            'location_data': location_data,
            'lastUpdated': timezone.now().isoformat()
        }

        return JsonResponse(data)

    def apply_filters(self, queryset, parcel_type, region_id, province_id, city_id):
        if parcel_type != 'all':
            queryset = queryset.filter(parcel_type=parcel_type)
        if region_id != 'all':
            queryset = queryset.filter(region_id=region_id)
        if province_id != 'all':
            queryset = queryset.filter(province_id=province_id)
        if city_id != 'all':
            queryset = queryset.filter(city_id=city_id)
        return queryset

    def get_workflow_filter(self, workflow_status):
        if workflow_status == 'completed':
            return Q(combustiblework__state='completed') | Q(foncier__state='completed') | \
                   Q(occupationwork__state='completed') | Q(upawork__state='completed')
        elif workflow_status == 'ongoing':
            return ~Q(combustiblework__state='completed') | ~Q(foncier__state='completed') | \
                   ~Q(occupationwork__state='completed') | ~Q(upawork__state='completed')
        return None

    def apply_time_range_filter(self, queryset, time_range):
        if time_range != 'all':
            time_filter = Q()
            if time_range == 'month':
                time_threshold = timezone.now() - timezone.timedelta(days=30)
            elif time_range == 'year':
                time_threshold = timezone.now() - timezone.timedelta(days=365)

            time_filter |= Q(combustiblework__created_at__gte=time_threshold)
            time_filter |= Q(foncier__created_at__gte=time_threshold)
            time_filter |= Q(occupationwork__created_at__gte=time_threshold)
            time_filter |= Q(upawork__created_at__gte=time_threshold)
            queryset = queryset.filter(time_filter)
        return queryset

    def get_workflow_status_data(self, parcels, status):
        workflow_models = {
            'Combustible': CombustibleWorkflow,
            'Foncier': FoncierWorkflow,
            'Occupation temporaire': OccupationWorkflow,
            "Autorisation d'urbanisme": AutorisationUrbanismeWorkflow,
        }
        
        return {
            workflow_name: self.get_workflow_status(workflow_model, parcels, status)
            for workflow_name, workflow_model in workflow_models.items()
        }

    def get_workflow_status(self, workflow_model, parcels, status):
        if workflow_model == FoncierWorkflow:
            base_query = FoncierWorkflow.objects.filter(parcel__in=parcels)
        else:
            base_query = workflow_model.objects.filter(parcel__in=parcels)

        if status == 'completed':
            workflow_counts = base_query.filter(state='completed').values('state').annotate(count=Count('id'))
        elif status == 'ongoing':
            workflow_counts = base_query.exclude(state='completed').values('state').annotate(count=Count('id'))
        else:  # 'all'
            workflow_counts = base_query.values('state').annotate(count=Count('id'))
        
        return [{'state': item['state'], 'count': item['count']} for item in workflow_counts]

    def get_location_data(self, parcels):
        regions = Region.objects.filter(parcel__in=parcels).distinct()
        provinces = Province.objects.filter(parcel__in=parcels).distinct()
        cities = City.objects.filter(parcel__in=parcels).distinct()

        return {
            'regions': [{'id': region.id, 'name': region.name} for region in regions],
            'provinces': [{'id': province.id, 'name': province.name, 'region_id': province.region_id} for province in provinces],
            'cities': [{'id': city.id, 'name': city.name, 'province_id': city.province_id} for city in cities],
        }

    def serialize_parcel_data(self, parcels, workflow_status):
        return [
            {
                'id': parcel.id,
                'type': parcel.parcel_type,
                'name': parcel.name,
                'area': parcel.area,
                'coordinates': [parcel.coordinates.x, parcel.coordinates.y],  # Modified for PointField
                'workflows': self.get_parcel_workflows(parcel, workflow_status),
                'region': parcel.region.name,
                'province': parcel.province.name,
                'city': parcel.city.name,
            }
            for parcel in parcels
        ]

    def get_parcel_workflows(self, parcel, status):
        workflows = []

        def add_workflows(workflow_set, workflow_type):
            for workflow in workflow_set.all():
                if status == 'all' or \
                   (status == 'completed' and workflow.state == 'completed') or \
                   (status == 'ongoing' and workflow.state != 'completed'):
                    workflows.append({'type': workflow_type, 'state': workflow.state})

        add_workflows(parcel.combustiblework, 'Combustible')
        if hasattr(parcel, 'foncier') and parcel.foncier is not None:
            if status == 'all' or \
               (status == 'completed' and parcel.foncier.state == 'completed') or \
               (status == 'ongoing' and parcel.foncier.state != 'completed'):
                workflows.append({'type': 'Foncier', 'state': parcel.foncier.state})
        add_workflows(parcel.occupationwork, 'Occupation temporaire')
        add_workflows(parcel.upawork, "Autorisation d'urbanisme")

        return workflows

class ParcelMapDataView(View):
    def get(self, request):
        parcels = Parcel.objects.select_related('region', 'province', 'city', 'foncier').prefetch_related(
            'combustiblework', 'occupationwork', 'upawork'
        ).all()

        data = [
            {
                'id': parcel.id,
                'name': parcel.name,
                'type': parcel.parcel_type,
                'area': parcel.area,
                'coordinates': [parcel.coordinates.x, parcel.coordinates.y],  # Modified for PointField
                'workflows': [
                    {'type': 'Combustible', 'state': workflow.state} for workflow in parcel.combustiblework.all()
                ] + (
                    [{'type': 'Foncier', 'state': parcel.foncier.state}] if hasattr(parcel, 'foncier') and parcel.foncier is not None else []
                ) + [
                    {'type': "Autorisation d'urbanisme", 'state': workflow.state} for workflow in parcel.upawork.all()
                ] + [
                    {'type': 'Occupation temporaire', 'state': workflow.state} for workflow in parcel.occupationwork.all()
                ]
            }
            for parcel in parcels
        ]

        return JsonResponse(data, safe=False)
# prix_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Prix/m²')
#     prix_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Prix Total')
#     proprietaire = models.CharField(max_length=255, null=True, blank=True, verbose_name='Propriétaire')



class ParcelDetailView(View):
    def get(self, request, parcel_id):
        try:
            parcel = Parcel.objects.select_related('region', 'province', 'city', 'foncier').get(id=parcel_id)
            
            data = {
                'id': parcel.id,
                'type': parcel.parcel_type,
                'area': parcel.area,
                'name': parcel.name,
                'situation': parcel.situation,
                'land_reference': parcel.land_reference,
                'region': parcel.region.name,
                'province': parcel.province.name,
                'city': parcel.city.name,
                'point_kilometrique': parcel.point_kilometrique,
            }

            # Check if Foncier data exists and add it to the response if it does
            if hasattr(parcel, 'foncier') :
                data.update({
                    'price': parcel.foncier.prix_m2,
                    'total_price': parcel.foncier.prix_total,
                    'proprietaire': parcel.foncier.proprietaire
                })

            return JsonResponse(data)
        except Parcel.DoesNotExist:
            return JsonResponse({'error': 'Parcel not found'}, status=404)




from django.views import View
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
import io
import csv
import json
import zipfile


# les_coordonnees_lambert = models.CharField(max_length=100)
#     long_lat = models.CharField(max_length=100)
#     coordinates = models.PolygonField()

from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404
from django.contrib.gis.geos import GEOSGeometry
from django.core.serializers.json import DjangoJSONEncoder
import json

class GISJSONEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, GEOSGeometry):
            if obj.geom_type == 'Polygon':
                # Extract just the coordinate pairs from the exterior ring
                return obj[0]
            return obj.coords
        return super().default(obj)

class ParcelDetailView2(View):
    def get(self, request, parcel_id):
        parcel = get_object_or_404(Parcel, id=parcel_id)
        
        data = {
            'id': parcel.id,
            'name': parcel.name,
            'parcel_type': parcel.parcel_type,
            'area': parcel.area,
            'region': parcel.region.name if parcel.region else None,
            'province': parcel.province.name if parcel.province else None,
            'city': parcel.city.name if parcel.city else None,
            'land_reference': parcel.land_reference,
            'point_kilometrique': parcel.point_kilometrique,
            'les_coords_lambert': parcel.les_coordonnees_lambert,
            'long_lat': parcel.long_lat,
            'coordinates': [parcel.coordinates.x, parcel.coordinates.y], 
        }
        
        return JsonResponse(data, encoder=GISJSONEncoder)
class WorkflowsView(View):
    def get(self, request, parcel_id):
        parcel = get_object_or_404(Parcel, id=parcel_id)

        def get_workflow_data(workflow_queryset):
            return [
                {
                    'id': w.id,
                    'state': w.state,
                    **{field.name: str(getattr(w, field.name)) for field in w._meta.fields if field.name not in ['id', 'state', 'parcel']},
                    'documents': [
                        {
                            'id': doc.id,
                            'name': doc.name,
                            'document_type': doc.document_type,
                            'url': request.build_absolute_uri(doc.document.url),
                            'created_at': doc.created_at.isoformat()
                        } for doc in w.documents.all()
                    ]
                }
                for w in workflow_queryset
            ]

        workflows = {
            'combustible': get_workflow_data(CombustibleWorkflow.objects.filter(parcel=parcel)),
            'foncier': get_workflow_data(FoncierWorkflow.objects.filter(parcel=parcel)),
            'urbanAuthorisation': get_workflow_data(AutorisationUrbanismeWorkflow.objects.filter(parcel=parcel)),
            'occupationTemp': get_workflow_data(OccupationWorkflow.objects.filter(parcel=parcel)),
        }
        return JsonResponse(workflows)

class WorkflowExportView(View):
    def get(self, request, parcel_id, workflow_type):
        parcel = get_object_or_404(Parcel, id=parcel_id)
        workflow_map = {
            'combustible': CombustibleWorkflow,
            'foncier': FoncierWorkflow,
            'urbanAuthorisation': AutorisationUrbanismeWorkflow,
            'occupationTemp': OccupationWorkflow
        }
        WorkflowModel = workflow_map.get(workflow_type)
        if not WorkflowModel:
            return HttpResponse(status=400)
        
        workflows = WorkflowModel.objects.filter(parcel=parcel)
        
        # Create a ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            # Create CSV data
            csv_buffer = io.StringIO()
            csv_writer = csv.writer(csv_buffer)
            
            # Get all fields from the workflow model
            fields = [field.name for field in WorkflowModel._meta.fields if field.name != 'parcel']
            
            # Add parcel name and type as the first two columns
            csv_writer.writerow(['Parcel Name', 'Parcel Type'] + fields + ['Documents'])
            
            for workflow in workflows:
                row_data = [parcel.name, parcel.parcel_type]  # Add parcel name and type
                row_data.extend([getattr(workflow, field) for field in fields])
                documents = [f"{doc.name} ({doc.document_type})" for doc in workflow.documents.all()]
                row_data.append(', '.join(documents))
                csv_writer.writerow(row_data)
            
            # Add documents to ZIP file
            for workflow in workflows:
                for document in workflow.documents.all():
                    zip_file.writestr(f"documents/{document.name}", document.document.read())
            
            # Add CSV to ZIP file
            zip_file.writestr('workflow_data.csv', csv_buffer.getvalue())
        
        # Prepare response
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{workflow_type}_export.zip"'
        return response
class SingleWorkflowExportView(View):
    def get(self, request, workflow_id, workflow_type):
        workflow_map = {
            'combustible': CombustibleWorkflow,
            'foncier': FoncierWorkflow,
            'urbanAuthorisation': AutorisationUrbanismeWorkflow,
            'occupationTemp': OccupationWorkflow
        }
        WorkflowModel = workflow_map.get(workflow_type)
        if not WorkflowModel:
            return HttpResponse(status=400)

        try:
            workflow = WorkflowModel.objects.get(id=workflow_id)
        except WorkflowModel.DoesNotExist:
            return HttpResponse(status=404)

        # Create a ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            # Create CSV data
            csv_buffer = io.StringIO()
            csv_writer = csv.writer(csv_buffer)
            
            fields = [field.name for field in workflow._meta.fields if field.name != 'parcel']
            
            # Add parcel name and type as the first two columns
            csv_writer.writerow(['Parcel Name', 'Parcel Type'] + fields + ['Documents'])
            
            row_data = [workflow.parcel.name, workflow.parcel.parcel_type]  # Add parcel name and type
            row_data.extend([getattr(workflow, field) for field in fields])
            documents = [f"{doc.name} ({doc.document_type})" for doc in workflow.documents.all()]
            row_data.append(', '.join(documents))
            csv_writer.writerow(row_data)
            
            # Add documents to ZIP file
            for document in workflow.documents.all():
                zip_file.writestr(f"documents/{document.name}", document.document.read())
            
            # Add CSV to ZIP file
            zip_file.writestr('workflow_data.csv', csv_buffer.getvalue())
        
        # Prepare response
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{workflow_type}_workflow_{workflow_id}_export.zip"'
        return response
    


    
from django.db import transaction


@method_decorator(csrf_exempt, name='dispatch')
class WorkflowDeleteView(View):
    def delete(self, request, workflow_id):
        workflow_models = [CombustibleWorkflow, FoncierWorkflow, AutorisationUrbanismeWorkflow, OccupationWorkflow]
        workflow = None
        for model in workflow_models:
            try:
                workflow = model.objects.get(id=workflow_id)
                break
            except model.DoesNotExist:
                continue
        
        if not workflow:
            return JsonResponse({'error': 'Workflow not found'}, status=404)

        try:
            with transaction.atomic():
                workflow_type = workflow.__class__.__name__.lower().replace('workflow', '')
                parcel_id = workflow.parcel.id
                workflow.delete()
            return JsonResponse({
                'success': True,
                'message': 'Workflow deleted successfully',
                'workflow_id': workflow_id,
                'workflow_type': workflow_type,
                'parcel_id': parcel_id
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.translation import gettext as _
from django.forms.models import model_to_dict
@api_view(['GET'])
def get_workflow_details(request, workflow_id, workflow_type):
    """Get detailed information about a specific workflow."""
    try:
        workflow_configs = {
            'foncier': {
                'model': FoncierWorkflow,
                'permissions': ['foncierworkflow.view_foncierworkflow'],
                'field_groups': {
                    'project_info': [
                        'nature_du_projet',
                        'prix_m2',
                        'prix_total',
                        'proprietaire',
                    ],
                    'payment_details': [
                        'date_de_paiement',
                        'paiement_montant',
                    ],
                    'title_info': [
                        'numero_de_titre',
                    ]
                }
            },
            'combustible': {
                'model': CombustibleWorkflow,
                'permissions': ['combustibleworkflow.view_combustibleworkflow'],
                'field_groups': {
                    'general_info': [
                        'company_name',
                        'station_type',
                        'urban_rural',
                        # 'creation_number',
                        # 'creation_date',
                    ],
                    'decision_details': [
                        'decision_number',
                        'decision_date',
                        'manager',
                        'status',
                        'management_type',
                    ],
                    'service_info': [
                        'service_number',
                        'service_date',
                    ]
                }
            },
            'occupationTemp': {
                'model': OccupationWorkflow,
                'permissions': ['occupationtempworkflow.view_occupationworkflow'],
                'field_groups': {
                    'occupation_details': [
                        'nature_occupation',
                        'decision_number',
                        'decision_date',
                        'duration',
                        'route_reference',
                    ]
                }
            },
            'urbanAuthorisation': {
                'model': AutorisationUrbanismeWorkflow,
                'permissions': ['upaworkflow.view_autorisationurbanismeworkflow'],
                'field_groups': {
                    'tnb_info': [
                        'tnb_amount',
                        'tnb_payment_date',
                    ],
                    'autorisation_details': [
                        'autorisation_number',
                        'autorisation_date',
                    ],
                    'attestation_info': [
                        'attestation_number',
                        'attestation_date',
                    ]
                }
            }
        }

        config = workflow_configs.get(workflow_type)
        if not config:
            return Response(
                {'error': _('Invalid workflow type')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check permissions
        if not any(request.user.has_perm(perm) for perm in config['permissions']):
            return Response(
                {'error': _('You do not have permission to view this workflow')},
                status=status.HTTP_403_FORBIDDEN
            )

        WorkflowModel = config['model']
        
        try:
            workflow = WorkflowModel.objects.select_related('parcel').prefetch_related('documents').get(id=workflow_id)
        except WorkflowModel.DoesNotExist:
            return Response(
                {'error': _('Workflow not found')},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Safely get parcel data
            parcel_data = {
                'id': workflow.parcel.id,
                'name': workflow.parcel.name,
                'parcel_type': getattr(workflow.parcel, 'parcel_type', None),
                'area': getattr(workflow.parcel, 'area', None)
            }

            # Base workflow data
            workflow_data = {
                'id': workflow.id,
                'created_at': workflow.created_at.isoformat() if workflow.created_at else None,
                'state': workflow.get_state_display() if hasattr(workflow, 'get_state_display') else workflow.state,
                'parcel': parcel_data
            }

            # Get all field values with error handling
            field_groups = {}
            for group_name, fields in config['field_groups'].items():
                field_groups[group_name] = {}
                for field in fields:
                    try:
                        value = getattr(workflow, field)
                        if value is not None:
                            if isinstance(value, (date, datetime)):
                                field_groups[group_name][field] = value.isoformat()
                            elif isinstance(value, (int, float, Decimal)):
                                field_groups[group_name][field] = float(value)
                            else:
                                field_groups[group_name][field] = str(value)
                        else:
                            field_groups[group_name][field] = None
                    except AttributeError:
                        field_groups[group_name][field] = None

            # Add documents with error handling
            documents = []
            for doc in workflow.documents.all():
                try:
                    print(doc.document.url)
                    documents.append({
    'id': doc.id,
    'name': doc.name,
    'document': doc.document.url if hasattr(doc.document, 'url') else None,  # Add document URL
    'document_type': doc.get_document_type_display() if hasattr(doc, 'get_document_type_display') else doc.document_type,
    'created_at': doc.created_at.isoformat() if doc.created_at else None
})

                except Exception as e:
                    print(f"Error processing document {doc.id}: {str(e)}")
                    continue

            response_data = {
                'workflow': workflow_data,
                'field_groups': field_groups,
                'documents': documents,
            }

            # Handle yearly data for occupation workflow
            if workflow_type == 'occupationTemp':
                try:
                    yearly_data = [{
                        'id': data.id,
                        'year': data.created_at.year if data.created_at else None,
                        'area_occupation': float(data.area_occupation) if data.area_occupation else None,
                        'royalty_amount': float(data.royalty_amount) if data.royalty_amount else None,
                        'created_at': data.created_at.isoformat() if data.created_at else None,
                        'documents': [{
    'id': doc.id,
    'name': doc.name,
    'document': doc.document.url if hasattr(doc.document, 'url') else None,  # Add document URL
    'document_type': doc.get_document_type_display() if hasattr(doc, 'get_document_type_display') else doc.document_type,
    'created_at': doc.created_at.isoformat() if doc.created_at else None
} for doc in data.documents.all()]

                    } for data in workflow.yearly_data.all()]
                    response_data['yearly_data'] = yearly_data
                except Exception as e:
                    print(f"Error processing yearly data: {str(e)}")
                    response_data['yearly_data'] = []

            return Response(response_data)

        except Exception as e:
            print(f"Error processing workflow data: {str(e)}")
            return Response(
                {'error': _('Error processing workflow data')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        print(f"Error in get_workflow_details: {str(e)}")
        return Response(
            {'error': _('An unexpected error occurred')},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
