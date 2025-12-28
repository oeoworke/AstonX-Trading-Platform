from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Asset, Order, MarketData
from .serializers import AssetSerializer, OrderSerializer
from users.models import Wallet, BalanceHistory
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
import yfinance as yf

# AI Model-ai import panrom
from .ai_model import AstonX_AI

# --- HELPER FUNCTION: Yahoo Finance Symbol Mapper ---
def get_yahoo_ticker(asset):
    symbol = asset.symbol
    category = asset.category

    # Special Symbols Mapping (Gold, Silver, Oil fix)
    symbol_map = {
        'XAUUSD': 'GC=F',   # Gold Futures
        'XAGUSD': 'SI=F',   # Silver Futures
        'USOIL': 'CL=F',    # Crude Oil WTI
        'UKOIL': 'BZ=F',    # Brent Crude Oil
    }

    if symbol in symbol_map:
        return symbol_map[symbol]
    
    if category == 'CRYPTO':
        return f"{symbol}-USD"
    elif category == 'FOREX':
        return f"{symbol}=X"
    
    return symbol

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
            user=user, asset=asset, order_type=order_type,
            lots=lots, open_price=price, stop_loss=sl_val,
            take_profit=tp_val, status='OPEN'
        )
        return Response({"message": "Order Placed Successfully!", "order_id": order.id})
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
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 6. Update SL/TP (Pencil icon click panni edit panna)
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
        yf_symbol = get_yahoo_ticker(asset)
        
        ticker = yf.Ticker(yf_symbol)
        df = ticker.history(period=period)
        
        count = 0
        for index, row in df.iterrows():
            MarketData.objects.update_or_create(
                asset=asset, timestamp=index,
                defaults={
                    "open_price": Decimal(str(row['Open'])), "high_price": Decimal(str(row['High'])),
                    "low_price": Decimal(str(row['Low'])), "close_price": Decimal(str(row['Close'])),
                    "volume": int(row['Volume']),
                }
            )
            count += 1
        return Response({"message": f"Successfully synced {count} data points for {symbol}"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 9. Bulk Sync with Freshness Check
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_sync_historical_data(request):
    try:
        latest_entry = MarketData.objects.order_by('-timestamp').first()
        if latest_entry:
            time_diff = timezone.now() - latest_entry.timestamp
            if time_diff < timedelta(hours=24):
                return Response({
                    "message": "Market data is already up to date! (Last synced within 24h)",
                    "status": "already_synced"
                })

        assets = Asset.objects.all()
        total_points = 0
        for asset in assets:
            yf_symbol = get_yahoo_ticker(asset) 
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period="1y")
            
            if df.empty: continue
            
            for index, row in df.iterrows():
                MarketData.objects.update_or_create(
                    asset=asset, timestamp=index,
                    defaults={
                        "open_price": Decimal(str(row['Open'])), "high_price": Decimal(str(row['High'])),
                        "low_price": Decimal(str(row['Low'])), "close_price": Decimal(str(row['Close'])),
                        "volume": int(row['Volume'])
                    }
                )
                total_points += 1
        
        return Response({
            "message": "Bulk Sync Completed Successfully!", 
            "status": "success",
            "total_points": total_points
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# --- 10. AI PREDICTION VIEW (Puthusa serthathu) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_prediction(request):
    symbol = request.query_params.get('symbol', 'BTC')
    
    # Check if we have enough data (Minimum 20 days thevai)
    data_count = MarketData.objects.filter(asset__symbol=symbol).count()
    if data_count < 20:
        return Response({
            "status": "error",
            "message": f"Insufficient data for {symbol}. Please sync market data first."
        }, status=400)

    try:
        # AI-ai initialize panni train panrom
        # Note: Dashboard-la fast-ah response vara 'epochs=5' vachurukom
        ai = AstonX_AI(symbol)
        ai.train_model(epochs=5)
        
        # Predict panrom
        prediction = ai.predict_next_move()
        
        return Response({
            "status": "success",
            "symbol": symbol,
            "prediction": prediction,
            "confidence": "High" if prediction != "HOLD" else "Low",
            "timestamp": timezone.now()
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)