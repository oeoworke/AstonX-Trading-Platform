from django.db import models

# Ippo ithuku per 'Asset' nu mathalam (Yena Stock, Crypto ellam sernthathu)
class Asset(models.Model):
    # Namma kitta irukura 3 vagaigal
    CATEGORY_CHOICES = (
        ('STOCK', 'Stock'),
        ('CRYPTO', 'Crypto'),
        ('FOREX', 'Forex'),
    )

    # Peyar (e.g., Bitcoin, Apple Inc)
    name = models.CharField(max_length=100) 
    
    # Symbol (e.g., BTC, AAPL, EURUSD)
    symbol = models.CharField(max_length=20)

    # Ithu thaan puthusa add pannirukom - Vagaigal
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='STOCK')

    def __str__(self):
        return f"{self.name} ({self.category})"