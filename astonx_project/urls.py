from django.contrib import admin
from django.urls import path
from main import views as main_views
from users import views as user_views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Market Data API
    path('api/assets/', main_views.get_assets, name='get_assets'),

    # User APIs
    path('api/register/', user_views.register_user, name='register'),
    path('api/login/', obtain_auth_token, name='login'), # Django-vin default login system
]