from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Wallet, Withdrawal # Withdrawal seththirukkoam

# Namakku thevaiyana pudhu fields-ai Admin panel-il kaatta
class CustomUserAdmin(UserAdmin):
    model = User
    # List view-il enna theriyanum
    list_display = ('email', 'username', 'full_name', 'phone_number', 'country', 'is_staff')
    
    # User-ai click panni ulla ponal enna theriyanum
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('full_name', 'phone_number', 'country', 'national_id')}),
    )
    
    # Search box
    search_fields = ('email', 'username', 'full_name', 'phone_number')

# Wallet-aiyum register panrom
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'leverage')

# --- NEW: WITHDRAWAL ADMIN CONFIGURATION ---
class WithdrawalAdmin(admin.ModelAdmin):
    # Admin list-la enna details theriyaanum
    list_display = ('id', 'user', 'amount', 'method', 'status', 'created_at')
    
    # Status, Method vechu filter panna (E.g., Only Pending requests)
    list_filter = ('status', 'method', 'created_at')
    
    # User email allathu transaction ID vechu search panna
    search_fields = ('user__email', 'transaction_id')
    
    # Pudhu requests mela varura maadhiri order panrom
    ordering = ('-created_at',)

# Pazhaya models matrum puthu Withdrawal model-ai register panrom
admin.site.register(User, CustomUserAdmin)
admin.site.register(Wallet, WalletAdmin)
admin.site.register(Withdrawal, WithdrawalAdmin) # Puthu line seththuttaen