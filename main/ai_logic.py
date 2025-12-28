import pandas as pd
from .models import MarketData, Asset
import numpy as np

def get_indicators_data(symbol):
    """
    Intha function database-la irukkira raw data-vai eduthu, 
    RSI, SMA maadhiri indicators sethu "AI-ready" data-va tharum.
    """
    # 1. Database-la irundhu data-vai edukkuroam
    data_query = MarketData.objects.filter(asset__symbol=symbol).order_by('timestamp')
    
    if not data_query.exists():
        return None

    # 2. Django QuerySet-ai Pandas DataFrame-ah maathuroam
    df = pd.DataFrame(list(data_query.values(
        'timestamp', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'
    )))

    # Prices-ai numbers-ah mathuroam (float)
    df['close_price'] = df['close_price'].astype(float)
    
    # --- INDICATORS CALCULATIONS ---

    # A. SMA (Simple Moving Average) - 10 and 20 periods
    # Market direction-ai kandupudikka
    df['sma_10'] = df['close_price'].rolling(window=10).mean()
    df['sma_20'] = df['close_price'].rolling(window=20).mean()

    # B. RSI (Relative Strength Index) - 14 periods
    # Market "Overbought"-ah (Mela) illa "Oversold"-ah (Keezha) nu solla
    delta = df['close_price'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))

    # C. Price Change (AI-kku trend puriya)
    df['price_change'] = df['close_price'].pct_change()

    # NaN (Empty) values-ai remove panroam (Calculations-nunaala aarambathula empty-ah irukkum)
    df = df.dropna()

    return df

def prepare_ai_features(symbol):
    """
    Training-kku thevaiyaana features mattum return pannum
    """
    df = get_indicators_data(symbol)
    if df is None:
        return None
    
    # AI training-kku thevaiyaana columns mattum edukkuroam
    features = df[['close_price', 'sma_10', 'sma_20', 'rsi', 'price_change']]
    return features