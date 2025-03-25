const WebSocket = require("ws");
const Redis = require("ioredis");

const redisSub = new Redis(process.env.REDIS_URL);
const redisPub = new Redis(process.env.REDIS_URL);

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);

    redisPub.publish("chat_channel", message);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

redisSub.subscribe("chat_channel");
redisSub.on("message", (channel, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});
