from django.urls import re_path
from . import consumers

# WebSocket URL definition
# Frontend-la 'ws://127.0.0.1:8000/ws/trade/' nu koopidanum
websocket_urlpatterns = [
    re_path(r'ws/trade/$', consumers.TradeConsumer.as_asgi()),
]