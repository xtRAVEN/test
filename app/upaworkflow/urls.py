from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutorisationUrbanismeWorkflowViewSet,DocumentViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'workflows', AutorisationUrbanismeWorkflowViewSet, basename='foncierworkflow')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
