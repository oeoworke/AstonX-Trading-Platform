import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
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
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None

    def prepare_sequences(self, data, window_size=60):
        """
        AI-kku 'Window' system-la data-vai kudukkanum.
        Example: Kadaisi 60 naatkaloda data-vai vachu 61-vathu naal-ai predict pannum.
        """
        X, y = [], []
        for i in range(window_size, len(data)):
            X.append(data[i-window_size:i])
            y.append(data[i, 0]) # 0 index la 'close_price' irukkum
        return np.array(X), np.array(y)

    def train_model(self, epochs=10, batch_size=32):
        """
        Database-la irukkira data-vai eduthu AI-kku 'Class' edukka porom.
        """
        # 1. Prepare Features from ai_logic.py
        df_features = prepare_ai_features(self.symbol)
        if df_features is None or len(df_features) < 100:
            return "Not enough data to train (At least 100 points needed)"

        # 2. Normalize Data (Values-ai 0 to 1-ukku mathuroam)
        # AI-kku periya numbers puriyaathu, 0 to 1 thaan nalla puriyum
        scaled_data = self.scaler.fit_transform(df_features)

        # 3. Create Sequences (Windowing)
        X, y = self.prepare_sequences(scaled_data)

        # 4. Build LSTM Model Architecture
        model = Sequential([
            # Modhal layer (50 neurons)
            LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
            Dropout(0.2), # Overfitting-ai thavirkka
            
            # Rendaavathu layer
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            
            # Output layer (1 neuron for price prediction)
            Dense(units=1)
        ])

        model.compile(optimizer='adam', loss='mean_squared_error')
        
        # 5. Training Process
        model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1)
        
        self.model = model
        # Model-ai save pannikkalaam
        model.save(f"{MODEL_DIR}/{self.symbol}_model.h5")
        return "Training Completed!"

    def predict_next_move(self):
        """
        Ippo irukkira trend-ai vachu adutha signal 'BUY' or 'SELL'-nu sollum.
        """
        # Model load panrom (Already train aanathu)
        model_path = f"{MODEL_DIR}/{self.symbol}_model.h5"
        if not os.path.exists(model_path):
            return "No trained model found for this asset"

        from tensorflow.keras.models import load_model
        model = load_model(model_path)

        # Kadaisi 60 days data edukkuroam
        df_features = prepare_ai_features(self.symbol)
        last_60_days = df_features.tail(60).values
        scaled_last_60 = self.scaler.fit_transform(last_60_days)
        
        # Format for AI
        X_test = np.array([scaled_last_60])
        
        # Prediction
        prediction = model.predict(X_test)
        
        # Simple Logic: Ippo price prediction-ai vida kuraivaa irundha BUY, adhigama irundha SELL
        current_val = scaled_last_60[-1, 0]
        predicted_val = prediction[0, 0]

        if predicted_val > current_val:
            return "BUY"
        else:
            return "SELL"