from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from main import views as main_views
from users import views as user_views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- ASSETS & PRICES ---
    path('api/assets/', main_views.get_assets, name='get_assets'),
    path('api/price/<str:category>/<str:symbol>/', main_views.get_live_price, name='live_price'),
    
    # --- TRADING OPERATIONS ---
    path('api/trade/place/', main_views.place_order, name='place_order'),
    path('api/trade/orders/', main_views.get_my_orders, name='my_orders'),
    path('api/trade/close/', main_views.close_order, name='close_order'),
    path('api/trade/update/', main_views.update_order, name='update_order'),
    path('api/trade/chart/', main_views.get_balance_chart_data, name='balance_chart'),
    
    # --- AUTHENTICATION & USER PROFILE ---
    path('api/register/', user_views.register_user, name='register'),
    path('api/login/', obtain_auth_token, name='login'),
    path('api/user/', user_views.get_user_profile, name='user_profile'),
    path('api/deposit/', user_views.deposit_funds, name='deposit'),
    path('api/user/picture/', user_views.update_profile_picture, name='update_picture'),

    # --- PUTHU ENDPOINTS: WITHDRAWAL SYSTEM ---
    # User withdrawal request anuppa:
    path('api/withdraw/request/', user_views.request_withdrawal, name='withdraw_request'),
    # User thannudaiya withdrawal history paarkka:
    path('api/withdraw/history/', user_views.get_my_withdrawals, name='withdraw_history'),
    
    # --- AI & DATA SYNC ---
    path('api/ai/sync-data/', main_views.sync_historical_data, name='sync_data'),
    path('api/ai/bulk-sync/', main_views.bulk_sync_historical_data, name='bulk_sync'),
    
    # --- AI PREDICTION & BOT CONTROLS ---
    path('api/ai-predict/', main_views.get_ai_prediction, name='ai-predict'),
    
    # --- BOT CONTROLS (TOGGLE & SETTINGS) ---
    path('api/ai/toggle-auto-pilot/', main_views.toggle_auto_pilot, name='toggle_auto_pilot'),
    
    # --- NEW: UPDATE BOT RISK SETTINGS ---
    path('api/ai/update-settings/', main_views.update_bot_settings, name='update_settings'),
]

# Media files serving logic (Profile pictures kaaga)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)