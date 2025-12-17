from rest_framework import serializers
from .models import Asset, Order

# Asset Serializer (Pazhayathu)
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'symbol', 'category']

# --- PUTHU ORDER SERIALIZER ---
class OrderSerializer(serializers.ModelSerializer):
    asset_symbol = serializers.CharField(source='asset.symbol', read_only=True) # Symbol ai direct ah kaatta

    class Meta:
        model = Order
        fields = ['id', 'asset', 'asset_symbol', 'order_type', 'lots', 'open_price', 'status', 'profit_loss', 'created_at']

 #Database la irukura Data-vai (Python object), React ku puriyura maathiri JSON ah maatha, "Serializer" thevai.