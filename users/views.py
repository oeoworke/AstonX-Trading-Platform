from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from decimal import Decimal
from .serializers import UserProfileSerializer

# User model-ai edukkuroam
User = get_user_model()

# --- 1. REGISTER API (Fixed Import Error) ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    
    # DEBUG: Terminal-la data varudha nu check panna
    print(f"DEBUG: Incoming Register Data -> {data}")
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    # 1. Email and Password check
    if not email or not password:
        return Response({
            'error': 'Email and Password are required fields.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # 2. Duplicate Email check
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'This email is already registered.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 3. User Create (Email as Username)
        user = User.objects.create_user(
            username=email, 
            email=email,
            password=password,
            full_name=full_name
        )
        
        # --- FIX: Wallet import correct-ah pannanum ---
        # Wallet users app-la dhaan irukku, so '.models' use pannanum
        from .models import Wallet 
        
        # Note: Models.py-la ulla Signal automatic-ah wallet create pannum. 
        # But safety-kku ingayum check panroam.
        wallet, created = Wallet.objects.get_or_create(user=user)
        
        # Initial balance set panroam
        wallet.balance = Decimal("10000.00")
        wallet.save()

        # Token creation for instant login
        token, _ = Token.objects.get_or_create(user=user)

        print(f"DEBUG: User {email} registered successfully!")
        
        return Response({
            "message": "User registered successfully!",
            "token": token.key
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"DEBUG: Registration Error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- 2. GET USER PROFILE ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


# --- 3. DEPOSIT API ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_funds(request):
    amount = request.data.get('amount')
    if not amount:
        return Response({"error": "Amount is required"}, status=400)
    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=400)
    except:
        return Response({"error": "Invalid number format"}, status=400)

    wallet = request.user.wallet
    wallet.balance += amount
    wallet.save()
    
    # History track for graph
    from users.models import BalanceHistory
    BalanceHistory.objects.create(wallet=wallet, balance=wallet.balance)
    
    return Response({
        "message": "Deposit Success!",
        "new_balance": float(wallet.balance)
    })


# --- 4. PROFILE PICTURE API ---
@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    user = request.user

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

    elif request.method == 'DELETE':
        if user.profile_picture:
            user.profile_picture.delete(save=True)
            return Response({"message": "Profile picture deleted!"})
        else:
            return Response({"error": "No picture to delete"}, status=400)