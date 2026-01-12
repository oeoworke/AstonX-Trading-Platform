import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TradeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Group name 'trade_updates' - Bot anuppura adhae name (run_bot.py logic-kku match aaganum)
        self.group_name = "trade_updates"

        # User-ai 'trade_updates' group-la join panna vaikkirom
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Handshake-ai confirm-ah accept panroam. 
        # Inga accept pannaala thaan frontend-la "Connected Successfully" steady-ah nikkum.
        await self.accept()
        print(f"DEBUG: WebSocket Connection Accepted for Group: {self.group_name}")

    async def disconnect(self, close_code):
        # Connection cut aagum pothu (tab close pannalaam) group-la irundhu remove panroam
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"DEBUG: WebSocket Disconnected with code: {close_code}")

    # Intha function thaan bot terminal-la irundhu vara 'trade_updates' signal-ai 
    # catch panni, sariyaana user-oda browser-kku anuppum.
    async def send_trade_update(self, event):
        # Bot anuppura 'message' dictionary-ai JSON-ah maaththi anuppuroam
        await self.send(text_data=json.dumps(event['message']))