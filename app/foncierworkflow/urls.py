from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoncierDocumentViewSet, FoncierWorkflowViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'workflows', FoncierWorkflowViewSet, basename='foncierworkflow')
router.register(r'documents', FoncierDocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
