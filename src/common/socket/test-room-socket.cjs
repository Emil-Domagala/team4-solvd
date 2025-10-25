const { io } = require("socket.io-client");

const SERVER_URL = "ws://localhost:3000";
const ROOM_NAME = "pokoj-testowy";

function createClient(name) {
  const socket = io(SERVER_URL, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log(` [${name}] Połączono: ${socket.id}`);
    socket.emit("joinRoom", { room: ROOM_NAME });
  });

  socket.on("system", (msg) => {
    console.log(` [${name}] SYSTEM: ${msg.text}`);
  });

  socket.on("message", (data) => {
    console.log(`[${name}] (${data.room}) ${data.from}: ${data.text}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(` [${name}] Rozłączono: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error(`[${name}] Błąd połączenia: ${err.message}`);
  });

  return socket;
}

const a = createClient("A");
const b = createClient("B");

setTimeout(() => {
  a.emit("sendMessage", { room: ROOM_NAME, text: "Cześć B" });
}, 1000);

setTimeout(() => {
  b.emit("sendMessage", { room: ROOM_NAME, text: "Hej A, widzę Cię" });
}, 2000);

setTimeout(() => {
  a.emit("leaveRoom", { room: ROOM_NAME });
}, 3000);

setTimeout(() => {
  b.emit("sendMessage", { room: ROOM_NAME, text: "A już wyszedł " });
}, 4000);

setTimeout(() => {
  console.log(" [SYSTEM] Test zakończony");
  a.disconnect();
  b.disconnect();
  process.exit(0);
}, 5000);