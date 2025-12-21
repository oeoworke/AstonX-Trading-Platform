from django.db import models
from django.conf import settings
from decimal import Decimal

# 1. Asset Model (Pazhayathu Appadiye Irukkatum)
class Asset(models.Model):
    CATEGORY_CHOICES = (
        ('STOCK', 'Stock'),
        ('CRYPTO', 'Crypto'),
        ('FOREX', 'Forex'),
    )
    name = models.CharField(max_length=100) 
    symbol = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='STOCK')

    def __str__(self):
        return f"{self.name} ({self.category})"

# 2. Order Model (User trades logic - Pazhayathu)
class Order(models.Model):
    ORDER_TYPES = (('BUY', 'Buy'), ('SELL', 'Sell'))
    STATUS_CHOICES = (('OPEN', 'Open'), ('CLOSED', 'Closed'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    
    order_type = models.CharField(max_length=4, choices=ORDER_TYPES) # BUY or SELL
    lots = models.DecimalField(max_digits=10, decimal_places=2) # Volume (Ex: 0.01)
    
    open_price = models.DecimalField(max_digits=20, decimal_places=8) # Vaangiya vilai
    close_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True) # Vitra vilai

    stop_loss = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    take_profit = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    profit_loss = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal("0.00"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.order_type} {self.asset.symbol} ({self.status})"

# --- 3. PUTHUSA SERKKA VENDIYA: Market Data Model (AI Training-kkaaga) ---
# Intha table thaan AI train panna historical data-vai save panni vaikkum
class MarketData(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="market_history")
    open_price = models.DecimalField(max_digits=20, decimal_places=5)
    high_price = models.DecimalField(max_digits=20, decimal_places=5)
    low_price = models.DecimalField(max_digits=20, decimal_places=5)
    close_price = models.DecimalField(max_digits=20, decimal_places=5)
    volume = models.BigIntegerField()
    timestamp = models.DateTimeField()

    class Meta:
        # Orey nerathula oru asset-ku oru entry thaan irukkanum
        unique_together = ('asset', 'timestamp') 

    def __str__(self):
        return f"{self.asset.symbol} at {self.timestamp}"