from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf.urls.i18n import i18n_patterns
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Custom Token Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        # Add user permissions to the response
        data['permissions'] = list(user.get_all_permissions())
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    

    
urlpatterns = [ path("admin/", admin.site.urls),]
               
#urlpatterns += [ re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),]

               
urlpatterns += [path('', include('django_backblaze_b2.urls'))]

urlpatterns += i18n_patterns(
    path('parcel/', include('parcel.urls')),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('foncier/', include('foncierworkflow.urls')),
    path('combustible/', include('combustibleworkflow.urls')),
    path('upaworkflow/', include('upaworkflow.urls')),
    path('occupation/', include('occupationtempworkflow.urls')),
    path('i18n/', include('django.conf.urls.i18n')),
)

# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all route for React app
urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name="index.html"))]
