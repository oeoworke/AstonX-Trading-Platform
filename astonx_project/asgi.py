"""
ASGI config for astonx_project project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
import django
from django.core.asgi import get_asgi_application

# Step 1: Django settings-ai set panroam
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'astonx_project.settings')

# Step 2: Django setup-ai initialize panroam. 
# Idhu thaan WebSocket-kku thevaiyaana models matrum apps-ai ready pannum.
django.setup()

# Step 3: Setup mudinjathukku appram thaan maththa Channels imports pannanum.
# Illai endraal 'Apps aren't loaded yet' error varum.
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import main.routing

# Intha application variable thaan ippo HTTP matrum WebSocket rendaiyum handle pannum
application = ProtocolTypeRouter({
    # Normal Django HTTP requests handle panna
    "http": get_asgi_application(),
    
    # WebSocket connection requests handle panna (Auth support-oda)
    "websocket": AuthMiddlewareStack(
        URLRouter(
            main.routing.websocket_urlpatterns
        )
    ),
})