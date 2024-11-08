from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OccupationDocumentViewSet,OccupationWorkflowViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'workflows', OccupationWorkflowViewSet, basename='occupationworkflow')
router.register(r'documents', OccupationDocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
