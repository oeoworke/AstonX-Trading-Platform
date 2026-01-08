import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TradeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Intha group name thaan bot-um use pannum
        self.group_name = "trade_updates"

        # User-ai group-la join panna vaikkirom
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Connection cut aagum pothu group-la irundhu remove panroam
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Intha function thaan bot anuppura message-ai catch panni user-kku send pannum
    async def send_trade_update(self, event):
        message = event['message']
        
        # User-oda browser-kku data-vai anuppuroam
        await self.send(text_data=json.dumps(message))