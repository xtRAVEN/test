from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CombustibleDocumentViewSet, CombustibleWorkflowViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'workflows', CombustibleWorkflowViewSet, basename='combustibleworkflow')
router.register(r'documents', CombustibleDocumentViewSet, basename='combustibledocument')

urlpatterns = [
    path('', include(router.urls)),
]
