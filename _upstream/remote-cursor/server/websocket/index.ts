import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { InstructionHandler } from '../services/instructionHandler';
import { pushNotificationService } from '../services/pushNotificationService';
import { FileWatcher } from '../services/fileWatcher';

export function setupWebSocket(
  server: HttpServer,
  instructionHandler: InstructionHandler,
  fileWatcher?: FileWatcher
): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('New Socket.IO connection established:', socket.id);

    // Send welcome message
    socket.emit('connection_status', {
      type: 'connection',
      message: 'Connected to Remote Cursor PC Agent Server',
      timestamp: new Date().toISOString(),
    });

    // Send initial project status on connection
    if (fileWatcher) {
      try {
        const status = fileWatcher.getCurrentStatus();
        socket.emit('project_status', {
          type: 'project_status',
          data: status,
          timestamp: new Date().toISOString(),
        });
        console.log('Sent initial project_status to client:', socket.id);
      } catch (error) {
        console.error('Error sending initial project_status:', error);
      }
    }

    // Handle instruction messages
    socket.on('instruction', async (data: unknown) => {
      try {
        console.log('Received instruction:', data);

        const message = {
          type: 'instruction',
          ...(typeof data === 'object' && data !== null ? data : { instruction: data }),
        };

        // Validate instruction
        if (!instructionHandler.validateInstruction(message)) {
          socket.emit('error', {
            type: 'error',
            message: 'Invalid instruction format. Expected: { instruction: "..." }',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        console.log('Processing instruction:', message.instruction);

        // Handle instruction and create task file
        const result = await instructionHandler.handleInstruction(message);

        // Send response to client
        if (result.success) {
          socket.emit('instruction_received', {
            type: 'instruction_received',
            message: result.message,
            filename: result.filename,
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit('error', {
            type: 'error',
            message: result.message,
            error: result.error,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error handling instruction:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle push notification token registration
    socket.on('register_push_token', (data: { token: string }) => {
      try {
        if (data && data.token) {
          pushNotificationService.registerToken(data.token);
          socket.emit('push_token_registered', {
            type: 'push_token_registered',
            success: true,
            message: 'Push token registered successfully',
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit('error', {
            type: 'error',
            message: 'Invalid push token data',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error registering push token:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Failed to register push token',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle push notification token unregistration
    socket.on('unregister_push_token', (data: { token: string }) => {
      try {
        if (data && data.token) {
          pushNotificationService.unregisterToken(data.token);
          console.log('[WebSocket] Push token unregistered');
        }
      } catch (error) {
        console.error('Error unregistering push token:', error);
      }
    });

    // Handle ping for connection testing
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO connection closed:', socket.id, 'Reason:', reason);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error('Socket.IO error:', error);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

// Export function to broadcast project status updates
export function broadcastProjectStatus(io: SocketIOServer, data: unknown): void {
  io.emit('project_status', data);
}

// Export function to broadcast log updates
export function broadcastLogUpdate(io: SocketIOServer, data: unknown): void {
  io.emit('log_update', data);
}

// Export function to broadcast task updates
export function broadcastTaskUpdate(io: SocketIOServer, data: unknown): void {
  io.emit('task_update', data);
}

// Export function to broadcast blocker alerts
export function broadcastBlockerAlert(io: SocketIOServer, data: unknown): void {
  io.emit('blocker_alert', data);
}
