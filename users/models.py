from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

# 1. Custom User Model
class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    national_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Profile Picture field
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

# 2. Wallet Model
class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("10000.00"))
    leverage = models.PositiveIntegerField(default=100)

    def __str__(self):
        return f"{self.user.email}'s Wallet"

# --- 3. Balance History (Dashboard Graph-kkaaga) ---
class BalanceHistory(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="history")
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet.user.username} - {self.balance} at {self.timestamp}"

# --- 4. WITHDRAWAL SYSTEM (Updated with Balance Deduction Logic) ---
class Withdrawal(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    METHOD_CHOICES = (
        ('CRYPTO', 'Crypto Wallet (USDT)'),
        ('BANK', 'Bank Transfer'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='CRYPTO')
    address_details = models.TextField(help_text="Bank details or Crypto Address")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- INTHA PUTHU LOGIC THAAN BALANCE-AI KURAICKUM ---
    def save(self, *args, **kwargs):
        # 1. Check if this is an update (pk exists)
        if self.pk:
            # Database-la ippo enna status irukku nu current status-ai edukkurom
            old_instance = Withdrawal.objects.get(pk=self.pk)
            
            # Print logs for debugging in your terminal
            print(f"DEBUG: Withdrawal Update -> User: {self.user.email}, Old Status: {old_instance.status}, New Status: {self.status}")

            # 2. 'PENDING' la irundhu 'APPROVED' ku maathum podhu mattum logic run pannanum
            if old_instance.status == 'PENDING' and self.status == 'APPROVED':
                wallet = self.user.wallet
                if wallet.balance >= self.amount:
                    print(f"DEBUG: Deducting ${self.amount} from Wallet...")
                    wallet.balance -= self.amount
                    wallet.save()
                    
                    # 3. Create BalanceHistory entry to update the dashboard graph
                    BalanceHistory.objects.create(wallet=wallet, balance=wallet.balance)
                else:
                    # Balance illai na request-ai auto-reject panniduvom
                    print("DEBUG: Insufficient balance to approve withdrawal.")
                    self.status = 'REJECTED'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - ${self.amount} ({self.status})"

# 5. Signals (Automating Wallet & Initial History Point)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        # User create aagumpothu Wallet create panrom
        wallet, _ = Wallet.objects.get_or_create(user=instance)
        # Graph-kkaaga aaramba point-ai (Initial balance) save panrom
        BalanceHistory.objects.create(wallet=wallet, balance=wallet.balance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_wallet(sender, instance, **kwargs):
    try:
        if hasattr(instance, 'wallet'):
            instance.wallet.save()
    except Wallet.DoesNotExist:
        pass