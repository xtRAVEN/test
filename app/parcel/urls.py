from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CityAutocomplete, 
    ParcelDashboardView, 
    ParcelDetailView, 
    ParcelDetailView2, 
    ParcelMapDataView, 
    ProvinceAutocomplete, 
    ParcelView, 
    ParcelViewSet,
    ParcelListView, 
    SingleWorkflowExportView, 
    WorkflowDeleteView, 
    WorkflowExportView, 
    WorkflowsView,
    get_locations,
    get_workflow_details
)

# Create a router and register your viewset with it
router = DefaultRouter()
router.register(r'list', ParcelViewSet)

urlpatterns = [
    path('province-autocomplete/', ProvinceAutocomplete.as_view(), name='province-autocomplete'),
    path('city-autocomplete/', CityAutocomplete.as_view(), name='city-autocomplete'),
    path('create/', ParcelView.as_view(), name='parcel-create'),
    path('update/<int:pk>/', ParcelView.as_view(), name='parcel-detail-update-delete'),  # For GET, PUT, DELETE requests
    # Include the router URLs
    path('', include(router.urls)),
    path('parcelall/', ParcelListView.as_view(), name='parcels-all'),
    path('parcel-dashboard/', ParcelDashboardView.as_view(), name='parcel_dashboard_data'),
    path('parcel-map/', ParcelMapDataView.as_view(), name='parcel_map_data'),
    path('parcel-detail/<int:parcel_id>/', ParcelDetailView.as_view(), name='parcel_detail'),
    path('parceldetails/<int:parcel_id>/', ParcelDetailView2.as_view(), name='parcel_detail'),
    path('parceldetails/<int:parcel_id>/workflows/', WorkflowsView.as_view(), name='parcel_workflows'),
    path('parceldetails/<int:parcel_id>/export-workflow/<str:workflow_type>/', WorkflowExportView.as_view(), name='export_workflow'),
    path('workflows/<int:workflow_id>/export/<str:workflow_type>/', SingleWorkflowExportView.as_view(), name='single_workflow_export'),
    path('workflows/<int:workflow_id>/', WorkflowDeleteView.as_view(), name='workflow-delete'),
    path('locations/', get_locations, name='get-locations'),
    path(
        'workflow-details/<str:workflow_type>/<int:workflow_id>/',
        get_workflow_details,
        name='workflow-details'
    ),
]