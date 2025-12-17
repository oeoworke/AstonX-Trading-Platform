from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Asset, Order
from .serializers import AssetSerializer, OrderSerializer
from users.models import Wallet
from decimal import Decimal
from django.utils import timezone
import yfinance as yf

# 1. Get All Assets
@api_view(['GET'])
def get_assets(request):
    assets = Asset.objects.all()
    serializer = AssetSerializer(assets, many=True)
    return Response(serializer.data)

# 2. Get Live Price (Real-Time from Yahoo Finance)
@api_view(['GET'])
def get_live_price(request, symbol, category):
    try:
        yf_symbol = symbol
        if category == 'CRYPTO': yf_symbol = f"{symbol}-USD"
        elif category == 'FOREX': yf_symbol = f"{symbol}=X"
        
        ticker = yf.Ticker(yf_symbol)
        
        # Fast fetch using 'fast_info' if available, else history
        if hasattr(ticker, 'fast_info') and ticker.fast_info.last_price:
             current_price = ticker.fast_info.last_price
        else:
             data = ticker.history(period="1d")
             if data.empty:
                 return Response({"error": "Price not found"}, status=404)
             current_price = data['Close'].iloc[-1]

        return Response({"symbol": symbol, "price": round(current_price, 5)})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 3. Place New Order
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    wallet = user.wallet
    data = request.data

    try:
        asset = Asset.objects.get(symbol=data['symbol'])
        order_type = data['type'] # BUY or SELL
        lots = Decimal(data['lots'])
        price = Decimal(data['price'])

        # Simple Margin Check (Can be enhanced later)
        required_margin = price * lots 
        if wallet.balance < required_margin:
            return Response({"error": "Insufficient Balance!"}, status=400)

        # Create Order
        order = Order.objects.create(
            user=user,
            asset=asset,
            order_type=order_type,
            lots=lots,
            open_price=price,
            status='OPEN'
        )
        
        return Response({"message": "Order Placed Successfully!", "order_id": order.id})

    except Asset.DoesNotExist:
        return Response({"error": "Asset not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 4. Get My Orders (Open & Closed)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    # Only OPEN orders first, then CLOSED
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# 5. Close Order (New Feature!)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_order(request):
    try:
        order_id = request.data.get('order_id')
        current_price = Decimal(request.data.get('current_price'))
        
        order = Order.objects.get(id=order_id, user=request.user, status='OPEN')
        
        # Calculate Profit/Loss
        # BUY: (Close - Open) * Lots
        # SELL: (Open - Close) * Lots
        if order.order_type == 'BUY':
            pnl = (current_price - order.open_price) * order.lots
        else:
            pnl = (order.open_price - current_price) * order.lots
            
        # Update Order
        order.status = 'CLOSED'
        order.close_price = current_price
        order.profit_loss = pnl
        order.closed_at = timezone.now()
        order.save()
        
        # Update Wallet Balance
        wallet = request.user.wallet
        wallet.balance += pnl
        wallet.save()
        
        return Response({"message": "Order Closed", "pnl": pnl, "new_balance": wallet.balance})
        
    except Order.DoesNotExist:
        return Response({"error": "Order not found or already closed"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)