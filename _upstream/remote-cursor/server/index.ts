import { createServer } from 'http';
import path from 'path';
import { createApp } from './app';
import {
  setupWebSocket,
  broadcastProjectStatus,
  broadcastTaskUpdate,
  broadcastBlockerAlert,
} from './websocket';
import { InstructionHandler } from './services/instructionHandler';
import { FileWatcher } from './services/fileWatcher';
import { pushNotificationService } from './services/pushNotificationService';
import config from './config';

// Create Express app
const app = createApp();

// Create HTTP server
const server = createServer(app);

// Setup Instruction Handler
const projectRoot = path.resolve(__dirname, '../../..');
const instructionHandler = new InstructionHandler(projectRoot);

// Setup File Watcher for progress.md (create before WebSocket so it can be passed)
const fileWatcher = new FileWatcher(projectRoot);

// Setup WebSocket server (pass fileWatcher for initial status on connection)
const io = setupWebSocket(server, instructionHandler, fileWatcher);
fileWatcher.start((status, diff) => {
  console.log('Progress file changed, broadcasting updates...');
  const timestamp = new Date().toISOString();

  // Always broadcast full project_status for major changes or initial connection
  if (diff.majorChange) {
    console.log('Major change detected, broadcasting full project_status');
    broadcastProjectStatus(io, {
      type: 'project_status',
      data: status,
      timestamp,
    });
  }

  // Broadcast individual task updates
  if (diff.taskUpdates.length > 0) {
    console.log(`Broadcasting ${diff.taskUpdates.length} task update(s)`);
    diff.taskUpdates.forEach((task) => {
      broadcastTaskUpdate(io, {
        type: 'task_update',
        data: task,
        timestamp,
      });
    });
  }

  // Broadcast new blocker alerts
  if (diff.newBlockers.length > 0) {
    console.log(`Broadcasting ${diff.newBlockers.length} blocker alert(s)`);
    diff.newBlockers.forEach((blocker) => {
      // Broadcast WebSocket event
      broadcastBlockerAlert(io, {
        type: 'blocker_alert',
        data: blocker,
        timestamp,
      });

      // Send push notification
      // Find the track name by looking up the task
      let trackName = 'Unknown';
      if (blocker.taskId) {
        for (const track of status.tracks) {
          const task = track.tasks.find((t) => t.id === blocker.taskId);
          if (task) {
            trackName = track.name;
            break;
          }
        }
      }

      // Send async push notification (fire and forget)
      pushNotificationService
        .sendBlockerAlert(blocker, trackName)
        .catch((error) => {
          console.error('[Push] Error sending blocker alert notification:', error);
        });
    });
  }

  // If no major change and no incremental updates, still send project_status
  // This handles edge cases where the structure didn't change but we want to notify
  if (!diff.majorChange && diff.taskUpdates.length === 0 && diff.newBlockers.length === 0) {
    console.log('Minor change without specific updates, broadcasting project_status');
    broadcastProjectStatus(io, {
      type: 'project_status',
      data: status,
      timestamp,
    });
  }
});

// Start server
server.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('Remote Cursor PC Agent Server');
  console.log('='.repeat(50));
  console.log(`HTTP Server: http://localhost:${config.port}`);
  console.log(`WebSocket Server: ws://localhost:${config.port}`);
  console.log(`Project Root: ${projectRoot}`);
  console.log(`Log Level: ${config.logLevel}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await fileWatcher.stop();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await fileWatcher.stop();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
