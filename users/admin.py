from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Wallet

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

# Pazhaya User model-ai neeki, namma puthu model-ai podurom
admin.site.register(User, CustomUserAdmin)
admin.site.register(Wallet, WalletAdmin)