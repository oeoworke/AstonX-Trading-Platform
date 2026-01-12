from django.urls import path, re_path
from . import consumers

# WebSocket URL definitions
# Frontend-la 'ws://127.0.0.1:8000/ws/trade/' nu koopidanum
websocket_urlpatterns = [
    # Path syntax: Idhu thaan ippo namma use panna pora stable route
    path('ws/trade/', consumers.TradeConsumer.as_asgi()),
    
    # Re_path (Regex) syntax: Neenga kudutha old code logic-um working-la irukkum
    re_path(r'ws/trade/$', consumers.TradeConsumer.as_asgi()),
]