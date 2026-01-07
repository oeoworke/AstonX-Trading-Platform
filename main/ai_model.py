import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from .ai_logic import prepare_ai_features
import os

# Model-ai save panna oru folder path
MODEL_DIR = "ai_models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

class AstonX_AI:
    def __init__(self, symbol):
        self.symbol = symbol
        # Multi-feature scaling: close, sma_10, sma_20, rsi, price_change
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model_path = f"{MODEL_DIR}/{self.symbol}_advanced_model.h5"
        self.window_size = 60 # Last 60 data points context

    def prepare_sequences(self, data):
        """
        AI-kku 'Window' system-la data-vai kudukkuroam.
        """
        X, y = [], []
        for i in range(self.window_size, len(data)):
            X.append(data[i-self.window_size:i])
            y.append(data[i, 0]) # Index 0 is always 'close_price'
        return np.array(X), np.array(y)

    def train_model(self, epochs=10, batch_size=32):
        """
        Advanced features (RSI, SMA) seththu AI-kku training tharuroam.
        """
        # 1. Fetch data from ai_logic.py (Already includes RSI, SMA)
        df_features = prepare_ai_features(self.symbol)
        
        if df_features is None or len(df_features) < 100:
            return "Not enough data to train (At least 100 points needed)"

        # 2. Normalize Data
        # Ippo namma indicators-aiyum sethu scale panroam
        scaled_data = self.scaler.fit_transform(df_features)

        # 3. Create Sequences
        X, y = self.prepare_sequences(scaled_data)

        # 4. Build Advanced LSTM Model Architecture
        # Multi-variate input (multiple features) handle pannum
        model = Sequential([
            LSTM(units=64, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
            Dropout(0.2),
            LSTM(units=64, return_sequences=False),
            Dropout(0.2),
            Dense(units=32),
            Dense(units=1) # Predicting the next Close Price
        ])

        model.compile(optimizer='adam', loss='mean_squared_error')
        
        # 5. Training Process
        # 'verbose=0' to keep terminal clean during bot run, change to 1 for manual shell training
        model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=0)
        
        # 6. Save Model
        model.save(self.model_path)
        return "Advanced Training Completed!"

    def predict_next_move(self):
        """
        Current trend + Indicators logic vachu 'BUY' or 'SELL' signal tharum.
        """
        if not os.path.exists(self.model_path):
            return "No trained model found"

        # Model-ai load panroam
        model = load_model(self.model_path)

        # Kadaisi data-vai edukkuroam
        df_features = prepare_ai_features(self.symbol)
        if df_features is None or len(df_features) < self.window_size:
            return "HOLD"

        # Predict panna thevaiyaana last window points
        recent_data = df_features.tail(self.window_size + 1).copy()
        
        # Training-la use panna adhe scaler logic
        # Mukkiyamaana maatram: transform mattum thaan pannanum (fit panna koodadhu)
        scaled_recent = self.scaler.fit_transform(df_features) # Using full history for best scaling context
        last_window = scaled_recent[-self.window_size:]
        
        # Format for AI Prediction
        X_input = np.array([last_window])
        
        # AI prediction (scaled value)
        predicted_scaled = model.predict(X_input, verbose=0)
        
        # --- SIGNAL LOGIC ---
        current_val_scaled = last_window[-1, 0] # Last known Close Price (scaled)
        predicted_val_scaled = predicted_scaled[0, 0]
        
        # Extra Indicator Check: RSI logic
        # RSI scaled index is 3 (based on ai_logic.py)
        current_rsi_scaled = last_window[-1, 3] 
        
        # AI Price Prediction + Momentum check
        # Prediction 0.5% difference logic
        if predicted_val_scaled > current_val_scaled * 1.005:
            # Price mela pogum, but RSI oversold-ah irundha innum nalla signal
            return "BUY"
        elif predicted_val_scaled < current_val_scaled * 0.995:
            # Price keezha varum
            return "SELL"
        else:
            return "HOLD"