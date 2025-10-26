/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { io, Socket } from 'socket.io-client';

// --- KONFIGURACJA --- //
const SOCKET_URL = 'http://localhost:3000'; // upewnij się, że Twój backend działa na tym porcie
const SOCKET_PATH = '/socket.io/'; // zgodne z NestJS WebSocketGateway
const TEAM_COUNT = 5; // liczba drużyn
const USERS_PER_TEAM = 2; // liczba użytkowników w drużynie
const MESSAGES_PER_USER = 3; // ile wiadomości wysyła każdy użytkownik

// --- POMOCNICZE FUNKCJE --- //
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function randText() {
  const words = ['hej', 'elo', 'test', 'XD', 'czat', 'halo', 'socket', 'redis'];
  return words[Math.floor(Math.random() * words.length)];
}

interface ReceivedEvent {
  team: string;
  user: string;
  event: string;
  data: any;
}

interface CreatedUser {
  socket: Socket;
  logs: ReceivedEvent[];
  username: string;
  teamId: string;
}

// --- TWORZENIE POJEDYNCZEGO UŻYTKOWNIKA --- //
async function createUser(
  teamId: string,
  userId: number,
): Promise<CreatedUser> {
  const username = `User${userId}_${teamId}`;

  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    path: SOCKET_PATH,
  });

  const logs: ReceivedEvent[] = [];

  socket.onAny((event, ...args) => {
    logs.push({ team: teamId, user: username, event, data: args[0] });
  });

  // 👂 dodatkowy listener — pokazuje broadcasty na żywo
  socket.on('team:broadcast', (msg) => {
    console.log(`📢 ${username} got broadcast from ${msg.teamId}: ${msg.text}`);
  });

  // czekamy na połączenie
  await new Promise<void>((res) => {
    socket.on('connect', () => res());
  });

  // dołączamy do drużyny
  socket.emit('team:join', {
    teamId,
    userId: String(userId),
    userName: username,
  });

  await delay(200 + Math.random() * 300);

  return { socket, logs, username, teamId };
}

// --- GŁÓWNA FUNKCJA TESTU --- //
async function main() {
  console.log(
    `🚀 Starting multi-team stress test (${TEAM_COUNT} teams × ${USERS_PER_TEAM} users)...`,
  );
  const allSockets: Socket[] = [];

  const teams: { teamId: string; users: CreatedUser[] }[] = [];

  // --- Tworzymy użytkowników w drużynach --- //
  for (let t = 1; t <= TEAM_COUNT; t++) {
    const teamId = `team-${t}`;
    const users: CreatedUser[] = [];

    for (let u = 1; u <= USERS_PER_TEAM; u++) {
      const user = await createUser(teamId, u);
      users.push(user);
      allSockets.push(user.socket);
    }

    teams.push({ teamId, users });
  }

  console.log(`✅ All ${TEAM_COUNT * USERS_PER_TEAM} users connected.`);

  // --- Każdy użytkownik wysyła wiadomości --- //
  for (const team of teams) {
    for (const user of team.users) {
      for (let m = 0; m < MESSAGES_PER_USER; m++) {
        const text = `${user.username}: ${randText()} (${m + 1})`;
        user.socket.emit('team:message', {
          teamId: user.teamId,
          senderId: user.username,
          senderName: user.username,
          text,
        });
        await delay(50 + Math.random() * 100);
      }
    }
  }

  console.log(`💬 All users sent ${MESSAGES_PER_USER} messages each.`);
  await delay(2000); // czekamy na broadcasty

  // --- Wszyscy wychodzą i się rozłączają --- //
  for (const team of teams) {
    for (const user of team.users) {
      user.socket.emit('team:leave', {
        teamId: user.teamId,
        userId: user.username,
        userName: user.username,
      });
      await delay(20);
      user.socket.disconnect();
    }
  }

  console.log('👋 All users left and disconnected.');
  await delay(1000);

  // --- Analiza logów --- //
  console.log('\n📊 TEST REPORT:');
  let ok = true;

  for (const team of teams) {
    const teamLogs = team.users.flatMap((u) => u.logs);
    const broadcasts = teamLogs.filter((x) => x.event === 'team:broadcast');
    const crossLeaks = broadcasts.filter(
      (m) => !m.data?.teamId || m.data.teamId !== team.teamId,
    );

    console.log(`\n🔸 ${team.teamId}:`);
    console.log(`   Broadcasts received: ${broadcasts.length}`);
    console.log(`   Cross-team leaks: ${crossLeaks.length}`);

    if (crossLeaks.length > 0) {
      ok = false;
      for (const leak of crossLeaks) {
        console.warn(
          `   ⚠️ Leak detected: user=${leak.user}, event=${leak.event}, from team=${leak.data?.teamId}`,
        );
      }
    }
  }

  if (ok) {
    console.log(
      `\n✅ All teams isolated correctly! Broadcasts delivered, no cross-team messages detected.`,
    );
  } else {
    console.error(
      `\n❌ Detected leaks between teams! Check your gateway logic.`,
    );
  }

  console.log('\n🧹 Test complete.');
}

// --- Start testu --- //
main().catch((err) => console.error('💥 Test failed:', err));
