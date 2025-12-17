from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserProfileSerializer
from decimal import Decimal
from rest_framework.parsers import MultiPartParser, FormParser

# Register API
@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully!"}, status=201)
    return Response(serializer.errors, status=400)

# Get User Profile API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

# Deposit API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_funds(request):
    amount = request.data.get('amount')
    if not amount:
        return Response({"error": "Amount thevai"}, status=400)
    try:
        amount = Decimal(amount)
        if amount <= 0:
            return Response({"error": "Sariyaana amount podunga"}, status=400)
    except:
        return Response({"error": "Invalid number"}, status=400)

    wallet = request.user.wallet
    wallet.balance += amount
    wallet.save()
    
    return Response({
        "message": "Deposit Success!",
        "new_balance": wallet.balance
    })

# --- PUTHU API: Upload / Delete Profile Picture ---
@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    user = request.user

    # PHOTO UPLOAD (POST)
    if request.method == 'POST':
        file_obj = request.FILES.get('profile_picture')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)
        
        user.profile_picture = file_obj
        user.save()
        
        return Response({
            "message": "Profile picture updated!",
            "profile_picture": user.profile_picture.url
        })

    # PHOTO DELETE (DELETE)
    elif request.method == 'DELETE':
        if user.profile_picture:
            user.profile_picture.delete(save=True)
            return Response({"message": "Profile picture deleted!"})
        else:
            return Response({"error": "No picture to delete"}, status=400)