const { io } = require("socket.io-client");

const SERVER_URL = "ws://localhost:3000";

function createClient(name, autoSend = false) {
  const socket = io(SERVER_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log(`[${name}] Połączono z serwerem! ID: ${socket.id}`);

    if (autoSend) {
      // wyślij testową wiadomość po 2 sekundach
      setTimeout(() => {
        const msg = `Wiadomość testowa od ${name} (${new Date().toLocaleTimeString()})`;
        console.log(`[${name}] Wysyłam:`, msg);
        socket.emit("message", { text: msg });
      }, 2000);
    }
  });

  socket.on("message", (data) => {
    console.log(`[${name}] Otrzymano wiadomość:`, data);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 [${name}] Rozłączono (${reason})`);
  });

  socket.on("connect_error", (err) => {
    console.error(`[${name}] Błąd połączenia:`, err.message);
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log(`[${name}] Próba ponownego połączenia (${attempt})...`);
  });

  socket.on("reconnect", (attempt) => {
    console.log(`[${name}] Ponownie połączono po ${attempt} próbach.`);
  });

  socket.on("reconnect_failed", () => {
    console.error(`[${name}] Nie udało się ponownie połączyć.`);
  });

  return socket;
}

// --- Tworzymy dwóch klientów ---
const client1 = createClient("Klient_1", true);
const client2 = createClient("Klient_2");

// --- Po 10 sekundach testujemy rozłączenie pierwszego klienta ---
setTimeout(() => {
  console.log("[SYSTEM] Odłączam Klient_1...");
  client1.disconnect();
}, 10000);

// --- Po 12 sekundach klient 2 wyśle kolejną wiadomość ---
setTimeout(() => {
  console.log("[Klient_2] Wysyłam wiadomość po 12 sekundach...");
  client2.emit("message", { text: "Druga wiadomość po 12 sekundach" });
}, 12000);

// --- Po 15 sekundach kończymy test ---
setTimeout(() => {
  console.log("[SYSTEM] Test zakończony, zamykam klientów.");
  client2.disconnect();
  process.exit(0);
}, 15000);
