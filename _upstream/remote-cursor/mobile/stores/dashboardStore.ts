import { create } from 'zustand';
import { ProjectStatus, Task, Track, Blocker, ActivityLogEntry, ConnectionStatus } from '@common/types';

interface DashboardState {
  projectStatus: ProjectStatus | null;
  connectionStatus: ConnectionStatus;
  logs: ActivityLogEntry[];

  // Actions
  setProjectStatus: (status: ProjectStatus) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addLog: (log: ActivityLogEntry) => void;
  clearLogs: () => void;

  // TASK-019-CLIENT: Incremental update actions
  updateTask: (task: Task) => void;
  addBlocker: (blocker: Blocker) => void;
  resolveBlocker: (blockerId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  projectStatus: null,
  connectionStatus: 'disconnected',
  logs: [],

  setProjectStatus: (status) => set({ projectStatus: status }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 100) })),
  clearLogs: () => set({ logs: [] }),

  // TASK-019-CLIENT: Update individual task
  updateTask: (task) => set((state) => {
    if (!state.projectStatus) return state;

    const updatedTracks = state.projectStatus.tracks.map(track => ({
      ...track,
      tasks: track.tasks.map(t => t.id === task.id ? task : t),
    }));

    // Recalculate completed tasks and track progress
    const completedTasks = updatedTracks.reduce((sum, track) =>
      sum + track.tasks.filter(t => t.status === 'done').length, 0
    );

    // Update track statistics
    const tracksWithStats = updatedTracks.map(track => {
      const trackCompletedTasks = track.tasks.filter(t => t.status === 'done').length;
      const trackTotalTasks = track.tasks.length;
      return {
        ...track,
        completedTasks: trackCompletedTasks,
        totalTasks: trackTotalTasks,
        progress: trackTotalTasks > 0 ? Math.round((trackCompletedTasks / trackTotalTasks) * 100) : 0,
      };
    });

    return {
      projectStatus: {
        ...state.projectStatus,
        tracks: tracksWithStats,
        completedTasks,
        lastUpdated: new Date().toISOString(),
      },
    };
  }),

  // TASK-019-CLIENT: Add new blocker
  addBlocker: (blocker) => set((state) => {
    if (!state.projectStatus) return state;

    // Check if blocker already exists
    if (state.projectStatus.blockers.some(b => b.id === blocker.id)) {
      return state;
    }

    return {
      projectStatus: {
        ...state.projectStatus,
        blockers: [...state.projectStatus.blockers, blocker],
        lastUpdated: new Date().toISOString(),
      },
    };
  }),

  // TASK-019-CLIENT: Resolve (remove) blocker
  resolveBlocker: (blockerId) => set((state) => {
    if (!state.projectStatus) return state;

    return {
      projectStatus: {
        ...state.projectStatus,
        blockers: state.projectStatus.blockers.filter(b => b.id !== blockerId),
        lastUpdated: new Date().toISOString(),
      },
    };
  }),
}));

// Selectors
export const useTracks = () => useDashboardStore((state) => state.projectStatus?.tracks ?? []);
export const useBlockers = () => useDashboardStore((state) => state.projectStatus?.blockers ?? []);
export const useOverallProgress = () => useDashboardStore((state) => ({
  completed: state.projectStatus?.completedTasks ?? 0,
  total: state.projectStatus?.totalTasks ?? 0,
  status: state.projectStatus?.overallStatus ?? 'Unknown',
}));
