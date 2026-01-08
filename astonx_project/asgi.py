"""
ASGI config for astonx_project project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Future: main.routing file-ai import pannuvom
# Ippo athu illatha nala empty list vechurukkom, aduthu ithai update pannuvom
from main.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'astonx_project.settings')

# Intha application variable thaan ippo HTTP matrum WebSocket rendaiyum handle pannum
application = ProtocolTypeRouter({
    # Normal Django HTTP requests
    "http": get_asgi_application(),
    
    # WebSocket connection requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})