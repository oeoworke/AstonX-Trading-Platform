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

# --- 1. REGISTER API ---
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
        
        # --- Wallet creation logic ---
        from .models import Wallet 
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


# --- 5. PUTHU API: REQUEST WITHDRAWAL (Option A) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_withdrawal(request):
    """
    User oru withdrawal request-ai intha API vazhiyaaga anuppuvaanga.
    Balance check panni, request-ai 'PENDING' status-la save pannuvom.
    """
    user = request.user
    data = request.data
    
    try:
        amount = Decimal(str(data.get('amount', 0)))
        method = data.get('method') # 'BANK' or 'CRYPTO'
        address_details = data.get('address_details')

        # 1. Basic validation
        if amount <= 0:
            return Response({"error": "Sariyaana amount-ai enter pannunga."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not method or not address_details:
            return Response({"error": "Payment method matrum details (Bank info/Crypto address) thevai."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Balance Check (Virtual Money check)
        if user.wallet.balance < amount:
            return Response({"error": "Unga wallet-la pothumaana balance illai."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Create Request (Status: PENDING by default in model)
        from .models import Withdrawal
        withdrawal = Withdrawal.objects.create(
            user=user,
            amount=amount,
            method=method,
            address_details=address_details,
            status='PENDING'
        )

        return Response({
            "message": "Withdrawal request success! Waiting 5-30 min for Approval.",
            "withdrawal_id": withdrawal.id,
            "current_status": withdrawal.status
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- 6. PUTHU API: GET MY WITHDRAWAL HISTORY ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_withdrawals(request):
    """
    User dashboard-la avanga panna withdrawal requests history-ai paarkka.
    """
    from .models import Withdrawal
    withdrawals = Withdrawal.objects.filter(user=request.user).order_by('-created_at')
    
    history_data = []
    for w in withdrawals:
        history_data.append({
            "id": w.id,
            "amount": float(w.amount),
            "method": w.method,
            "status": w.status,
            "address": w.address_details,
            "date": w.created_at.strftime("%Y-%m-%d %H:%M")
        })
    
    return Response(history_data)