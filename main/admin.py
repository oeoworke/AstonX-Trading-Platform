from django.contrib import admin
from .models import Asset

# Admin panel la namma Asset table ah register panrom
@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    # Admin list la enna columns theriyanum
    list_display = ('name', 'symbol', 'category')
    
    # Edhula filter panna mudiyum (Right side la varum)
    list_filter = ('category',)
    
    # Search box venuma?
    search_fields = ('name', 'symbol')