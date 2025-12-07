from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Asset
from .serializers import AssetSerializer

# HTML ku bathila, ippo JSON Data anuppurom (API)
@api_view(['GET'])
def get_assets(request):
    # Database la irunthu ella assets-ayum edukkirom
    assets = Asset.objects.all()
    
    # 'many=True' endral niraiya data irukku nu artham
    # Data va JSON format ku maathurom
    serializer = AssetSerializer(assets, many=True)
    
    # JSON data va thiruppi anuppurom
    return Response(serializer.data)