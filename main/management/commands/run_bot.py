import time
from django.core.management.base import BaseCommand
from main.models import Asset, Order, UserAutoPilot
from main.ai_model import AstonX_AI
from django.contrib.auth import get_user_model
from decimal import Decimal
import yfinance as yf

# Dynamically get the custom user model
User = get_user_model()

class Command(BaseCommand):
    help = 'Runs the AstonX Personalized Risk-Aware Automatic Trading Bot'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('AstonX Bot Engine Started (Custom Risk Management Enabled)...'))
        
        while True:
            try:
                # Yaar ellaam active-ah switch on pannirukaanga nu list edukkurom
                active_subscriptions = UserAutoPilot.objects.filter(is_active=True)
                
                if not active_subscriptions.exists():
                    self.stdout.write("No users have enabled Auto-Pilot. Waiting...")
                else:
                    # Endha assets-la ellam active users irukaanga nu unique-ah edukkurom
                    distinct_assets = Asset.objects.filter(id__in=active_subscriptions.values_list('asset_id', flat=True).distinct())
                    
                    for asset in distinct_assets:
                        subscribed_users_for_asset = active_subscriptions.filter(asset=asset)
                        self.process_asset(asset, subscribed_users_for_asset)
                
                # Scan interval
                time.sleep(60)
                
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING('Bot Stopped Manually.'))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Bot Global Error: {str(e)}'))
                time.sleep(10)

    def process_asset(self, asset, active_users_settings):
        self.stdout.write(f'Scanning: {asset.symbol} for {active_users_settings.count()} active users')
        
        try:
            ai = AstonX_AI(asset.symbol)
            ai.train_model(epochs=3) 
            prediction = ai.predict_next_move()
            
            self.stdout.write(f'AI Signal for {asset.symbol}: {prediction}')

            if prediction == 'HOLD' or "trained model found" in str(prediction):
                return

            yf_symbol = f"{asset.symbol}-USD" if asset.category == 'CRYPTO' else f"{asset.symbol}=X"
            ticker = yf.Ticker(yf_symbol)
            history = ticker.history(period="1d")
            if history.empty: 
                self.stdout.write(self.style.WARNING(f'Price not found for {asset.symbol}'))
                return
            
            current_price = Decimal(str(history['Close'].iloc[-1]))
            
            # Loop through only the users who enabled auto-pilot for this asset
            for setting in active_users_settings:
                # Ippo execute_trade-ku 'setting' object-aiye anuppuroam
                self.execute_trade(setting, asset, prediction, current_price)
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error processing {asset.symbol}: {str(e)}'))

    def execute_trade(self, setting, asset, prediction, current_price):
        """
        Execute trade based on individual user's risk settings.
        """
        user = setting.user
        try:
            if not hasattr(user, 'wallet'):
                return
                
            wallet = user.wallet
            
            # --- CUSTOM RISK LOGIC START ---
            # Backend-la fixed values-ai thavirthu, user set panna values-ai edukkuroam
            lots = setting.lot_size
            sl_pct = setting.stop_loss_pct / Decimal("100") # Ex: 1% -> 0.01
            tp_pct = setting.take_profit_pct / Decimal("100") # Ex: 2% -> 0.02
            
            required_margin = current_price * lots
            
            if wallet.balance < required_margin:
                self.stdout.write(self.style.WARNING(f'Insufficient funds for {user.username} on {asset.symbol} (Requires ${required_margin})'))
                return

            # Safety check: Already order open-la irukka?
            existing_order = Order.objects.filter(user=user, asset=asset, status='OPEN').exists()
            if existing_order:
                return

            # SL & TP Calculation based on user's custom percentages
            if prediction == 'BUY':
                sl = current_price * (Decimal("1") - sl_pct)
                tp = current_price * (Decimal("1") + tp_pct)
            else: # SELL
                sl = current_price * (Decimal("1") + sl_pct)
                tp = current_price * (Decimal("1") - tp_pct)
            # --- CUSTOM RISK LOGIC END ---

            # Place Order with User's Settings
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
            
            self.stdout.write(self.style.SUCCESS(
                f'Bot Success: {prediction} placed for {user.username} on {asset.symbol} | '
                f'Lots: {lots}, SL: {setting.stop_loss_pct}%, TP: {setting.take_profit_pct}%'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Trade execution failed for {user.username}: {str(e)}'))