from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from main import views as main_views
from users import views as user_views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/assets/', main_views.get_assets, name='get_assets'),
    path('api/register/', user_views.register_user, name='register'),
    path('api/login/', obtain_auth_token, name='login'),
    
    path('api/user/', user_views.get_user_profile, name='user_profile'),
    path('api/deposit/', user_views.deposit_funds, name='deposit'),
    
    # --- PUTHU API: Upload & Delete Picture ---
    path('api/user/picture/', user_views.update_profile_picture, name='update_picture'),
]

# Media Files URL Setup
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)