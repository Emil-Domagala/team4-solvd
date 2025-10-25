import { Injectable, Logger } from '@nestjs/common';
import { EventNames } from 'node_modules/socket.io/dist/typed-events';
import { Server, Socket } from 'socket.io';

/**
 * Generic SocketService with type-safe events.
 * - Uses rooms for group/team broadcasts
 * - Supports private messaging via userSockets map
 */
@Injectable()
export class SocketService<
  ServerToClientEvents extends Record<string, (...args: any[]) => void> = any,
> {
  protected server: Server<any, ServerToClientEvents>;
  private clients: Map<string, Socket<any, ServerToClientEvents>> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // only for private messaging
  protected readonly logger = new Logger(SocketService.name);

  /** Set the Socket.IO server instance */
  setServer(server: Server<any, ServerToClientEvents>) {
    this.server = server;
    this.logger.debug('Socket server initialized');
  }

  /** Track a connected client; optionally associate with a userId */
  addClient(client: Socket<any, ServerToClientEvents>, userId?: string) {
    this.clients.set(client.id, client);

    if (userId) {
      if (!this.userSockets.has(userId))
        this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);
    }

    this.logger.debug(
      `Client connected: ${client.id}${userId ? ` (user: ${userId})` : ''}`,
    );
  }

  /** Remove a disconnected client and clean up user mapping */
  removeClient(client: Socket<any, ServerToClientEvents>) {
    this.clients.delete(client.id);

    for (const [userId, socketSet] of this.userSockets.entries()) {
      if (socketSet.has(client.id)) {
        socketSet.delete(client.id);
        if (socketSet.size === 0) this.userSockets.delete(userId);
        break;
      }
    }

    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // ------------------ Type-safe emit helpers ------------------

  /** Send event to a single socket */
  emitToClient<EventName extends EventNames<ServerToClientEvents>>(
    clientId: string,
    event: EventName,
    ...args: Parameters<ServerToClientEvents[EventName]>
  ) {
    const client = this.clients.get(clientId);
    if (!client) {
      this.logger.warn(`Client ${clientId} not found`);
      return;
    }
    client.emit(event, ...args);
  }

  /** Send event to a user across all their connected sockets */
  emitToUser<EventName extends EventNames<ServerToClientEvents>>(
    userId: string,
    event: EventName,
    ...args: Parameters<ServerToClientEvents[EventName]>
  ) {
    const socketSet = this.userSockets.get(userId);
    if (!socketSet) return;
    for (const clientId of socketSet)
      this.emitToClient(clientId, event, ...args);
  }

  /** Send event to all connected clients */
  emitToAll<EventName extends EventNames<ServerToClientEvents>>(
    event: EventName,
    ...args: Parameters<ServerToClientEvents[EventName]>
  ) {
    if (!this.server) {
      this.logger.warn('Server not set');
      return;
    }
    this.server.emit(event as any, ...args);
  }

  /** Send event to all clients in a room */
  emitToRoom<EventName extends EventNames<ServerToClientEvents>>(
    room: string,
    event: EventName,
    ...args: Parameters<ServerToClientEvents[EventName]>
  ) {
    if (!this.server) {
      this.logger.warn('Server not set');
      return;
    }
    this.server.to(room).emit(event, ...(args as any));
  }

  /** Send event to all clients in a room except one socket */
  emitToRoomExcept<EventName extends EventNames<ServerToClientEvents>>(
    room: string,
    excludeClientId: string,
    event: EventName,
    ...args: Parameters<ServerToClientEvents[EventName]>
  ) {
    if (!this.server) {
      this.logger.warn('Server not set');
      return;
    }
    this.server
      .to(room)
      .except(excludeClientId)
      .emit(event, ...(args as any));
  }
}
