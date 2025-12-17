from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Wallet

User = get_user_model()

# User Create panrathukaana Serializer (Pazhayathu)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'full_name', 'phone_number', 'country', 'national_id']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# --- PUTHUSA SERKKA VENDIYAVAI ---

# Wallet Balance-ai kaatta
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['balance', 'leverage']

# User Profile + Wallet serthu kaatta
class UserProfileSerializer(serializers.ModelSerializer):
    wallet = WalletSerializer(read_only=True) # User-oda wallet-aiyum serthu anuppurom

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'country', 'wallet', 'profile_picture']