import time
from django.core.management.base import BaseCommand
from main.models import Asset, Order, UserAutoPilot # UserAutoPilot model sirkappattullathu
from main.ai_model import AstonX_AI
from django.contrib.auth import get_user_model # Corrected Import
from decimal import Decimal
import yfinance as yf

# Dynamically get the custom user model (users.User)
User = get_user_model()

class Command(BaseCommand):
    help = 'Runs the AstonX Personalized Automatic Trading Bot'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('AstonX Bot Engine Started (Personalized Mode)...'))
        
        # Oru continuous loop-ai start panrom (Car engine start aagidichi!)
        while True:
            try:
                # --- NEW LOGIC START ---
                # Ippo namma 'Asset' table-la filter pannaama, 'UserAutoPilot' table-ai paarkurom
                # Yaar ellaam active-ah switch on pannirukaanga nu list edukkurom
                active_subscriptions = UserAutoPilot.objects.filter(is_active=True)
                
                if not active_subscriptions.exists():
                    self.stdout.write("No users have enabled Auto-Pilot. Waiting...")
                else:
                    # Endha assets-la ellam active users irukaanga nu unique-ah edukkurom
                    distinct_assets = Asset.objects.filter(id__in=active_subscriptions.values_list('asset_id', flat=True).distinct())
                    
                    for asset in distinct_assets:
                        # Intha asset-ukku yaar ellam active-ah irukaangalo avangalai mattum filter panrom
                        subscribed_users_for_asset = active_subscriptions.filter(asset=asset)
                        self.process_asset(asset, subscribed_users_for_asset)
                # --- NEW LOGIC END ---
                
                # 2. Wait for 60 seconds (Oru nimisham interval)
                time.sleep(60)
                
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING('Bot Stopped Manually.'))
                break
            except Exception as e:
                # Logging error clearly to help debugging
                self.stdout.write(self.style.ERROR(f'Bot Global Error: {str(e)}'))
                time.sleep(10)

    def process_asset(self, asset, active_users_settings):
        # Ippo scanning message-la user count-aiyum kaattum
        self.stdout.write(f'Scanning: {asset.symbol} for {active_users_settings.count()} active users')
        
        try:
            # AI prediction ketaakum
            ai = AstonX_AI(asset.symbol)
            # Bot-kkaaga fast-ah train panrom
            ai.train_model(epochs=3) 
            prediction = ai.predict_next_move()
            
            self.stdout.write(f'AI Signal for {asset.symbol}: {prediction}')

            if prediction == 'HOLD' or "trained model found" in str(prediction):
                return

            # Current Price edukkuroam
            yf_symbol = f"{asset.symbol}-USD" if asset.category == 'CRYPTO' else f"{asset.symbol}=X"
            ticker = yf.Ticker(yf_symbol)
            history = ticker.history(period="1d")
            if history.empty: 
                self.stdout.write(self.style.WARNING(f'Price not found for {asset.symbol}'))
                return
            
            current_price = Decimal(str(history['Close'].iloc[-1]))
            
            # loop through ONLY the users who have enabled auto-pilot for THIS specific asset
            for setting in active_users_settings:
                user = setting.user
                self.execute_trade(user, asset, prediction, current_price)
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error processing {asset.symbol}: {str(e)}'))

    def execute_trade(self, user, asset, prediction, current_price):
        try:
            # 1. Wallet check
            if not hasattr(user, 'wallet'):
                return
                
            wallet = user.wallet
            lots = Decimal("0.01") # Bot default lot size
            required_margin = current_price * lots
            
            if wallet.balance < required_margin:
                self.stdout.write(self.style.WARNING(f'Insufficient funds for {user.username} on {asset.symbol}'))
                return

            # 2. Already oru trade open-la irukkaa nu check panrom (Safety)
            existing_order = Order.objects.filter(user=user, asset=asset, status='OPEN').exists()
            if existing_order:
                return

            # 3. Stop Loss (1%) & Take Profit (2%) calculate panrom
            if prediction == 'BUY':
                sl = current_price * Decimal("0.99")
                tp = current_price * Decimal("1.02")
            else: # SELL
                sl = current_price * Decimal("1.01")
                tp = current_price * Decimal("0.98")

            # 4. Order-ai database-la place panrom
            Order.objects.create(
                user=user, 
                asset=asset, 
                order_type=prediction,
                lots=lots, 
                open_price=current_price, 
                stop_loss=sl, 
                take_profit=tp, 
                status='OPEN'
            )
            
            self.stdout.write(self.style.SUCCESS(f'Bot Success: {prediction} placed for {user.username} on {asset.symbol} at ${current_price}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Trade execution failed for {user.username}: {str(e)}'))