from django.contrib import admin
from .models import Asset, Order, MarketData

# 1. Asset Admin 
@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'symbol', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'symbol')

# 2. Order Admin 
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'asset', 'order_type', 'status', 'profit_loss', 'created_at')
    list_filter = ('status', 'order_type')
    search_fields = ('user__username', 'asset__symbol')

# 3. Market Data Admin
@admin.register(MarketData)
class MarketDataAdmin(admin.ModelAdmin):
    list_display = ('asset', 'timestamp', 'open_price', 'close_price', 'volume')
    list_filter = ('asset__symbol',)
    search_fields = ('asset__symbol',)