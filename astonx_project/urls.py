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
    
    # --- PUTHU TRADING URLs ---
    path('api/price/<str:category>/<str:symbol>/', main_views.get_live_price, name='live_price'),
    path('api/trade/place/', main_views.place_order, name='place_order'),
    path('api/trade/orders/', main_views.get_my_orders, name='my_orders'),
    path('api/trade/close/', main_views.close_order, name='close_order'),
    
    # Authentication & User Profile
    path('api/register/', user_views.register_user, name='register'),
    path('api/login/', obtain_auth_token, name='login'),
    path('api/user/', user_views.get_user_profile, name='user_profile'),
    path('api/deposit/', user_views.deposit_funds, name='deposit'),
    
    # Profile Picture
    path('api/user/picture/', user_views.update_profile_picture, name='update_picture'),
    
    # Edit SL/TP
    path('api/trade/update/', main_views.update_order, name='update_order'),

    # --- PUTHU URL: Dashboard Balance Graph Data (Intha path than miss agi irunthathu) ---
    path('api/trade/chart/', main_views.get_balance_chart_data, name='balance_chart'),

     # --- PUTHU URL: AI Data Sync ---
    path('api/ai/sync-data/', main_views.sync_historical_data, name='sync_data'),

    # --- BULK SYNC URL ---
    path('api/ai/bulk-sync/', main_views.bulk_sync_historical_data, name='bulk_sync'),
]

# Media files serving logic
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)