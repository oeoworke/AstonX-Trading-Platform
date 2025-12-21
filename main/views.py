from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Asset, Order, MarketData
from .serializers import AssetSerializer, OrderSerializer
from users.models import Wallet, BalanceHistory
from decimal import Decimal
from django.utils import timezone
import yfinance as yf

# 1. Get All Assets (Market list kaga)
@api_view(['GET'])
def get_assets(request):
    assets = Asset.objects.all()
    serializer = AssetSerializer(assets, many=True)
    return Response(serializer.data)

# 2. Get Live Price (Yahoo Finance moolam)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_live_price(request, symbol, category):
    try:
        yf_symbol = symbol
        if category == 'CRYPTO': yf_symbol = f"{symbol}-USD"
        elif category == 'FOREX': yf_symbol = f"{symbol}=X"
        
        ticker = yf.Ticker(yf_symbol)
        data = ticker.history(period="1d")
        
        if not data.empty:
            current_price = data['Close'].iloc[-1]
            return Response({"symbol": symbol, "price": round(current_price, 5)})
        return Response({"error": "Price not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 3. Place New Order (SL/TP logic-oda)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    wallet = user.wallet
    data = request.data

    try:
        asset = Asset.objects.get(symbol=data['symbol'])
        order_type = data['type'] 
        lots = Decimal(data['lots'])
        price = Decimal(data['price'])
        
        sl = data.get('stop_loss')
        tp = data.get('take_profit')
        sl_val = Decimal(sl) if sl else None
        tp_val = Decimal(tp) if tp else None

        required_margin = price * lots 
        if wallet.balance < required_margin:
            return Response({"error": "Insufficient Balance!"}, status=400)

        order = Order.objects.create(
            user=user,
            asset=asset,
            order_type=order_type,
            lots=lots,
            open_price=price,
            stop_loss=sl_val,
            take_profit=tp_val,
            status='OPEN'
        )
        
        return Response({"message": "Order Placed Successfully!", "order_id": order.id})

    except Asset.DoesNotExist:
        return Response({"error": "Asset not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 4. Get My Orders (With Status Filter)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    status_filter = request.query_params.get('status')
    orders = Order.objects.filter(user=request.user)
    
    if status_filter:
        orders = orders.filter(status=status_filter)
    
    orders = orders.order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# 5. Close Order (Wallet update & Graph snapshot)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_order(request):
    try:
        order_id = request.data.get('order_id')
        current_price = Decimal(request.data.get('current_price'))
        
        order = Order.objects.get(id=order_id, user=request.user, status='OPEN')
        
        if order.order_type == 'BUY':
            pnl = (current_price - order.open_price) * order.lots
        else:
            pnl = (order.open_price - current_price) * order.lots
            
        order.status = 'CLOSED'
        order.close_price = current_price
        order.profit_loss = pnl
        order.closed_at = timezone.now()
        order.save()
        
        wallet = request.user.wallet
        wallet.balance += pnl
        wallet.save()

        BalanceHistory.objects.create(wallet=wallet, balance=wallet.balance)
        
        return Response({"message": "Order Closed", "pnl": pnl, "new_balance": wallet.balance})
        
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 6. Update SL/TP
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order(request):
    try:
        order_id = request.data.get('order_id')
        sl = request.data.get('stop_loss')
        tp = request.data.get('take_profit')
        
        order = Order.objects.get(id=order_id, user=request.user, status='OPEN')
        
        order.stop_loss = Decimal(sl) if sl else None
        order.take_profit = Decimal(tp) if tp else None
        order.save()
        
        return Response({"message": "Order Updated Successfully!"})
        
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 7. Get Balance History Data for Chart
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_balance_chart_data(request):
    try:
        history = BalanceHistory.objects.filter(wallet__user=request.user).order_by('timestamp')
        data = [{"time": h.timestamp.strftime("%H:%M"), "balance": float(h.balance)} for h in history]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 8. Single Symbol Sync Function
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_historical_data(request):
    symbol = request.data.get('symbol')
    period = request.data.get('period', '1y') 
    
    try:
        asset = Asset.objects.get(symbol=symbol)
        yf_symbol = symbol
        if asset.category == 'CRYPTO': yf_symbol = f"{symbol}-USD"
        elif asset.category == 'FOREX': yf_symbol = f"{symbol}=X"
        
        ticker = yf.Ticker(yf_symbol)
        df = ticker.history(period=period)
        
        count = 0
        for index, row in df.iterrows():
            MarketData.objects.update_or_create(
                asset=asset,
                timestamp=index,
                defaults={
                    "open_price": Decimal(str(row['Open'])),
                    "high_price": Decimal(str(row['High'])),
                    "low_price": Decimal(str(row['Low'])),
                    "close_price": Decimal(str(row['Close'])),
                    "volume": int(row['Volume']),
                }
            )
            count += 1
            
        return Response({"message": f"Successfully synced {count} data points for {symbol}"})
        
    except Asset.DoesNotExist:
        return Response({"error": "Asset not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# --- 9. NEW: Bulk Sync for ALL Assets (Dashboard-il irunthu koopidalam) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_sync_historical_data(request):
    try:
        assets = Asset.objects.all()
        total_synced = 0
        sync_summary = []

        for asset in assets:
            yf_symbol = asset.symbol
            if asset.category == 'CRYPTO': yf_symbol = f"{asset.symbol}-USD"
            elif asset.category == 'FOREX': yf_symbol = f"{asset.symbol}=X"
            
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period="1y")
            
            if df.empty:
                continue

            count = 0
            for index, row in df.iterrows():
                MarketData.objects.update_or_create(
                    asset=asset,
                    timestamp=index,
                    defaults={
                        "open_price": Decimal(str(row['Open'])),
                        "high_price": Decimal(str(row['High'])),
                        "low_price": Decimal(str(row['Low'])),
                        "close_price": Decimal(str(row['Close'])),
                        "volume": int(row['Volume']),
                    }
                )
                count += 1
            
            total_synced += count
            sync_summary.append(f"{asset.symbol}: {count} points")

        return Response({
            "message": "Bulk Sync Completed Successfully!",
            "total_points": total_synced,
            "details": sync_summary
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)