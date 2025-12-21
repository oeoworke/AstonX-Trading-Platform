from rest_framework import serializers
from .models import Asset, Order

# Asset Serializer
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'symbol', 'category']

# Order Serializer (Updated with Close Price & History Fields)
class OrderSerializer(serializers.ModelSerializer):
    asset_symbol = serializers.CharField(source='asset.symbol', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 
            'asset', 
            'asset_symbol', 
            'order_type', 
            'lots', 
            'open_price', 
            'close_price',  # <-- Nan Fix seiya ithu thevai
            'stop_loss', 
            'take_profit', 
            'status', 
            'profit_loss', 
            'created_at',
            'closed_at'    # <-- History timing kaatta ithu thevai
        ]