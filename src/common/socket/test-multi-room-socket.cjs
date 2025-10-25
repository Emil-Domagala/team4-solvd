const { io } = require("socket.io-client");

const SERVER_URL = "ws://localhost:3000";

const clients = [
  { name: "A", room: "pokoj-1" },
  { name: "B", room: "pokoj-2" },
  { name: "C", room: "pokoj-1" },
];

function log(name, type, msg) {
  console.log(`${icons[type] || ""} [${name}] ${msg}`);
}

function createClient({ name, room }) {
  const socket = io(SERVER_URL, { transports: ["websocket"] });

  socket.on("connect", () => {
    log(name, "ok", `Połączono z serwerem: ${socket.id}`);
    socket.emit("joinRoom", { room });
  });

  socket.on("system", (data) => {
    log(name, "sys", `${data.text}`);
  });

  socket.on("message", (data) => {
    log(name, "info", `(ROOM: ${data.room}) ${data.from}: ${data.text}`);
  });

  socket.on("disconnect", (reason) => {
    log(name, "sys", `Rozłączono: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    log(name, "err", `Błąd połączenia: ${err.message}`);
  });

  return socket;
}

const sockets = clients.map(createClient);

setTimeout(() => {
  sockets[0].emit("sendMessage", { room: "pokoj-1", text: "Cześć z pokoju 1!" });
}, 1000);

setTimeout(() => {
  sockets[1].emit("sendMessage", { room: "pokoj-2", text: "Witam z pokoju 2" });
}, 2000);

setTimeout(() => {
  sockets[2].emit("sendMessage", { room: "pokoj-1", text: "Też jestem w pokoju 1" });
}, 3000);

setTimeout(() => {
  sockets[1].emit("sendMessage", { room: "pokoj-1", text: "Halo z pokoju 2 👀 (powinienem być zignorowany)" });
}, 4000);

setTimeout(() => {
  console.log("\n [SYSTEM] Test zakończony — rozłączam klientów.\n");
  sockets.forEach((s) => s.disconnect());
  process.exit(0);
}, 5000);
