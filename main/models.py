from django.db import models
from django.conf import settings
from decimal import Decimal

# Asset Model (Pazhayathu Appadiye Irukkatum)
class Asset(models.Model):
    CATEGORY_CHOICES = (
        ('STOCK', 'Stock'),
        ('CRYPTO', 'Crypto'),
        ('FOREX', 'Forex'),
    )
    name = models.CharField(max_length=100) 
    symbol = models.CharField(max_length=20)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='STOCK')

    def __str__(self):
        return f"{self.name} ({self.category})"

# --- PUTHUSA SERKKA VENDIYA 'ORDER' MODEL ---
class Order(models.Model):
    ORDER_TYPES = (('BUY', 'Buy'), ('SELL', 'Sell'))
    STATUS_CHOICES = (('OPEN', 'Open'), ('CLOSED', 'Closed'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    
    order_type = models.CharField(max_length=4, choices=ORDER_TYPES) # BUY or SELL
    lots = models.DecimalField(max_digits=10, decimal_places=2) # Volume (Ex: 0.01)
    
    open_price = models.DecimalField(max_digits=20, decimal_places=8) # Vaangiya vilai
    close_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True) # Vitra vilai
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    profit_loss = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal("0.00"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.order_type} {self.asset.symbol} ({self.status})"