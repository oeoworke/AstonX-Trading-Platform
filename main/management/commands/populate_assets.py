from django.core.management.base import BaseCommand
from main.models import Asset

class Command(BaseCommand):
    help = 'Bulk populates the database with 100+ assets'

    def handle(self, *args, **kwargs):
        # Top 150+ popular assets from TradingView
        assets_data = [
            # --- CRYPTO (Top 50 Popular Coins) ---
            {'name': 'Bitcoin', 'symbol': 'BTC', 'category': 'CRYPTO'},
            {'name': 'Ethereum', 'symbol': 'ETH', 'category': 'CRYPTO'},
            {'name': 'Binance Coin', 'symbol': 'BNB', 'category': 'CRYPTO'},
            {'name': 'Solana', 'symbol': 'SOL', 'category': 'CRYPTO'},
            {'name': 'Ripple', 'symbol': 'XRP', 'category': 'CRYPTO'},
            {'name': 'Cardano', 'symbol': 'ADA', 'category': 'CRYPTO'},
            {'name': 'Dogecoin', 'symbol': 'DOGE', 'category': 'CRYPTO'},
            {'name': 'Avalanche', 'symbol': 'AVAX', 'category': 'CRYPTO'},
            {'name': 'Polkadot', 'symbol': 'DOT', 'category': 'CRYPTO'},
            {'name': 'Polygon', 'symbol': 'MATIC', 'category': 'CRYPTO'},
            {'name': 'Shiba Inu', 'symbol': 'SHIB', 'category': 'CRYPTO'},
            {'name': 'Litecoin', 'symbol': 'LTC', 'category': 'CRYPTO'},
            {'name': 'Tron', 'symbol': 'TRX', 'category': 'CRYPTO'},
            {'name': 'Uniswap', 'symbol': 'UNI', 'category': 'CRYPTO'},
            {'name': 'Chainlink', 'symbol': 'LINK', 'category': 'CRYPTO'},
            {'name': 'Cosmos', 'symbol': 'ATOM', 'category': 'CRYPTO'},
            {'name': 'Monero', 'symbol': 'XMR', 'category': 'CRYPTO'},
            {'name': 'Ethereum Classic', 'symbol': 'ETC', 'category': 'CRYPTO'},
            {'name': 'Stellar', 'symbol': 'XLM', 'category': 'CRYPTO'},
            {'name': 'Bitcoin Cash', 'symbol': 'BCH', 'category': 'CRYPTO'},
            {'name': 'Near Protocol', 'symbol': 'NEAR', 'category': 'CRYPTO'},
            {'name': 'Algorand', 'symbol': 'ALGO', 'category': 'CRYPTO'},
            {'name': 'VeChain', 'symbol': 'VET', 'category': 'CRYPTO'},
            {'name': 'Filecoin', 'symbol': 'FIL', 'category': 'CRYPTO'},
            {'name': 'Decentraland', 'symbol': 'MANA', 'category': 'CRYPTO'},
            {'name': 'The Sandbox', 'symbol': 'SAND', 'category': 'CRYPTO'},
            {'name': 'Axie Infinity', 'symbol': 'AXS', 'category': 'CRYPTO'},
            {'name': 'Aave', 'symbol': 'AAVE', 'category': 'CRYPTO'},
            {'name': 'EOS', 'symbol': 'EOS', 'category': 'CRYPTO'},
            {'name': 'Tezos', 'symbol': 'XTZ', 'category': 'CRYPTO'},
            
            # --- FOREX (Majors & Minors) ---
            {'name': 'Euro / US Dollar', 'symbol': 'EURUSD', 'category': 'FOREX'},
            {'name': 'British Pound / US Dollar', 'symbol': 'GBPUSD', 'category': 'FOREX'},
            {'name': 'US Dollar / Japanese Yen', 'symbol': 'USDJPY', 'category': 'FOREX'},
            {'name': 'US Dollar / Swiss Franc', 'symbol': 'USDCHF', 'category': 'FOREX'},
            {'name': 'Australian Dollar / US Dollar', 'symbol': 'AUDUSD', 'category': 'FOREX'},
            {'name': 'US Dollar / Canadian Dollar', 'symbol': 'USDCAD', 'category': 'FOREX'},
            {'name': 'New Zealand Dollar / US Dollar', 'symbol': 'NZDUSD', 'category': 'FOREX'},
            {'name': 'Euro / British Pound', 'symbol': 'EURGBP', 'category': 'FOREX'},
            {'name': 'Euro / Japanese Yen', 'symbol': 'EURJPY', 'category': 'FOREX'},
            {'name': 'British Pound / Japanese Yen', 'symbol': 'GBPJPY', 'category': 'FOREX'},
            {'name': 'Australian Dollar / Japanese Yen', 'symbol': 'AUDJPY', 'category': 'FOREX'},
            {'name': 'Euro / Australian Dollar', 'symbol': 'EURAUD', 'category': 'FOREX'},
            # Commodities (Forex category for simplicity)
            {'name': 'Gold / US Dollar', 'symbol': 'XAUUSD', 'category': 'FOREX'},
            {'name': 'Silver / US Dollar', 'symbol': 'XAGUSD', 'category': 'FOREX'},
            {'name': 'Brent Crude Oil', 'symbol': 'UKOIL', 'category': 'FOREX'},
            {'name': 'WTI Crude Oil', 'symbol': 'USOIL', 'category': 'FOREX'},

            # --- STOCKS (Major US Tech & Blue Chips) ---
            {'name': 'Apple Inc.', 'symbol': 'AAPL', 'category': 'STOCK'},
            {'name': 'Microsoft Corp.', 'symbol': 'MSFT', 'category': 'STOCK'},
            {'name': 'Google (Alphabet)', 'symbol': 'GOOGL', 'category': 'STOCK'},
            {'name': 'Amazon.com', 'symbol': 'AMZN', 'category': 'STOCK'},
            {'name': 'Tesla, Inc.', 'symbol': 'TSLA', 'category': 'STOCK'},
            {'name': 'NVIDIA Corp.', 'symbol': 'NVDA', 'category': 'STOCK'},
            {'name': 'Meta Platforms', 'symbol': 'META', 'category': 'STOCK'},
            {'name': 'Netflix', 'symbol': 'NFLX', 'category': 'STOCK'},
            {'name': 'Adobe', 'symbol': 'ADBE', 'category': 'STOCK'},
            {'name': 'AMD', 'symbol': 'AMD', 'category': 'STOCK'},
            {'name': 'Intel', 'symbol': 'INTC', 'category': 'STOCK'},
            {'name': 'Coca-Cola', 'symbol': 'KO', 'category': 'STOCK'},
            {'name': 'PepsiCo', 'symbol': 'PEP', 'category': 'STOCK'},
            {'name': 'McDonald\'s', 'symbol': 'MCD', 'category': 'STOCK'},
            {'name': 'Disney', 'symbol': 'DIS', 'category': 'STOCK'},
            {'name': 'Nike', 'symbol': 'NKE', 'category': 'STOCK'},
            {'name': 'JPMorgan Chase', 'symbol': 'JPM', 'category': 'STOCK'},
            {'name': 'Visa', 'symbol': 'V', 'category': 'STOCK'},
            {'name': 'Mastercard', 'symbol': 'MA', 'category': 'STOCK'},
            {'name': 'PayPal', 'symbol': 'PYPL', 'category': 'STOCK'},
            {'name': 'Salesforce', 'symbol': 'CRM', 'category': 'STOCK'},
            {'name': 'Oracle', 'symbol': 'ORCL', 'category': 'STOCK'},
            {'name': 'IBM', 'symbol': 'IBM', 'category': 'STOCK'},
            {'name': 'Uber', 'symbol': 'UBER', 'category': 'STOCK'},
            {'name': 'Airbnb', 'symbol': 'ABNB', 'category': 'STOCK'},
            {'name': 'Boeing', 'symbol': 'BA', 'category': 'STOCK'},
            {'name': 'General Motors', 'symbol': 'GM', 'category': 'STOCK'},
            {'name': 'Ford', 'symbol': 'F', 'category': 'STOCK'},
            {'name': 'Exxon Mobil', 'symbol': 'XOM', 'category': 'STOCK'},
            {'name': 'Chevron', 'symbol': 'CVX', 'category': 'STOCK'},
            {'name': 'Walmart', 'symbol': 'WMT', 'category': 'STOCK'},
            {'name': 'Target', 'symbol': 'TGT', 'category': 'STOCK'},
            {'name': 'Costco', 'symbol': 'COST', 'category': 'STOCK'},
        ]

        self.stdout.write(self.style.WARNING(f'Checking {len(assets_data)} assets...'))

        count = 0
        for item in assets_data:
            # Using get_or_create to avoid duplicates, safe to run multiple times
            obj, created = Asset.objects.get_or_create(
                symbol=item['symbol'],
                defaults={
                    'name': item['name'],
                    'category': item['category']
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created: {item['name']}"))
                count += 1
            else:
                # Showing a dot (.) if already exists to avoid spam
                self.stdout.write('.', ending='')

        self.stdout.write(self.style.SUCCESS(f'\n\nSuccess! Added {count} new assets.'))