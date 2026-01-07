from django.db import models
from django.conf import settings
from decimal import Decimal

# 1. Asset Model
class Asset(models.Model):
    CATEGORY_CHOICES = (
        ('STOCK', 'Stock'),
        ('CRYPTO', 'Crypto'),
        ('FOREX', 'Forex'),
    )
    name = models.CharField(max_length=100) 
    symbol = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='STOCK')
    
    # NOTE: Ippo Asset table-la irukkira intha field common switch-ah irundhathu.
    # Namma pudhu table create pannadhala ithu dummy-ah irukkum.
    is_auto_pilot = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.category})"

# --- 2. UPDATED MODEL: Personalized Bot Switch with Risk Management ---
# Intha table thaan user-aiyum asset-aiyum link panni, personalized settings-ai kavanikkum.
class UserAutoPilot(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="bot_settings"
    )
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    
    # --- PUTHU FIELDS: Custom Risk Management ---
    # Intha fields thaan user-oda settings-ai database-la save pannum.
    lot_size = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.01"))
    stop_loss_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("1.00"))
    take_profit_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("2.00"))
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Oru user oru asset-ukku (Example: BTC) ore oru setting thaan vachirukka mudiyum.
        unique_together = ('user', 'asset')

    def __str__(self):
        return f"{self.user.username} - {self.asset.symbol}: {'ON' if self.is_active else 'OFF'}"

# 3. Order Model (User trades logic)
class Order(models.Model):
    ORDER_TYPES = (('BUY', 'Buy'), ('SELL', 'Sell'))
    STATUS_CHOICES = (('OPEN', 'Open'), ('CLOSED', 'Closed'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    
    order_type = models.CharField(max_length=4, choices=ORDER_TYPES) 
    lots = models.DecimalField(max_digits=10, decimal_places=2) 
    
    open_price = models.DecimalField(max_digits=20, decimal_places=8) 
    close_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True) 

    stop_loss = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    take_profit = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    profit_loss = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal("0.00"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.order_type} {self.asset.symbol} ({self.status})"

# 4. Market Data Model (AI Training-kkaaga)
class MarketData(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="market_history")
    open_price = models.DecimalField(max_digits=20, decimal_places=5)
    high_price = models.DecimalField(max_digits=20, decimal_places=5)
    low_price = models.DecimalField(max_digits=20, decimal_places=5)
    close_price = models.DecimalField(max_digits=20, decimal_places=5)
    volume = models.BigIntegerField()
    timestamp = models.DateTimeField()

    class Meta:
        unique_together = ('asset', 'timestamp') 

    def __str__(self):
        return f"{self.asset.symbol} at {self.timestamp}"