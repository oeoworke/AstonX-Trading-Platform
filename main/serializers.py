from rest_framework import serializers
from .models import Asset

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'symbol', 'category']




 #Database la irukura Data-vai (Python object), React ku puriyura maathiri JSON ah maatha, "Serializer" thevai.