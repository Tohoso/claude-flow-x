import fs from 'fs';
import path from 'path';
import {
  ProjectStatus,
  ProjectStatusDiff,
  Track,
  Task,
  Blocker,
  TaskStatus,
  TrackStatus,
} from '@common/types';

export class ProgressParser {
  private progressFilePath: string;
  private previousStatus: ProjectStatus | null = null;

  constructor(watchDir: string) {
    this.progressFilePath = path.join(watchDir, 'progress.md');
  }

  /**
   * Parse progress.md and extract project status
   */
  public parseProgress(): ProjectStatus {
    try {
      const content = fs.readFileSync(this.progressFilePath, 'utf-8');

      const tracks = this.extractTracks(content);
      const blockers = this.extractBlockers(content);

      const currentStatus: ProjectStatus = {
        lastUpdated: this.extractLastUpdated(content),
        tracks,
        blockers,
        overallStatus: this.determineOverallStatus(tracks, blockers),
        completedTasks: this.countCompletedTasks(tracks),
        totalTasks: this.countTotalTasks(tracks),
      };

      return currentStatus;
    } catch (error) {
      console.error('Error parsing progress.md:', error);
      return this.getDefaultStatus();
    }
  }

  /**
   * Calculate diff between current and previous status
   * Also updates the previousStatus after calculating diff
   */
  public calculateDiff(currentStatus: ProjectStatus): ProjectStatusDiff {
    // If no previous status, everything is new
    if (!this.previousStatus) {
      // Store current as previous for next time
      this.previousStatus = JSON.parse(JSON.stringify(currentStatus));

      return {
        taskUpdates: this.getAllTasks(currentStatus),
        newBlockers: currentStatus.blockers,
        resolvedBlockers: [],
        majorChange: true,
      };
    }

    const taskUpdates: Task[] = [];
    const newBlockers: Blocker[] = [];
    const resolvedBlockers: string[] = [];

    // Create maps for efficient lookup
    const prevTasksMap = new Map<string, Task>();
    this.previousStatus.tracks.forEach((track) => {
      track.tasks.forEach((task) => {
        prevTasksMap.set(task.id, task);
      });
    });

    const prevBlockersMap = new Map<string, Blocker>();
    this.previousStatus.blockers.forEach((blocker) => {
      prevBlockersMap.set(blocker.id, blocker);
    });

    // Detect task changes
    currentStatus.tracks.forEach((track) => {
      track.tasks.forEach((task) => {
        const prevTask = prevTasksMap.get(task.id);
        if (!prevTask) {
          // New task
          taskUpdates.push(task);
        } else if (this.hasTaskChanged(prevTask, task)) {
          // Task status or properties changed
          taskUpdates.push(task);
        }
      });
    });

    // Detect new blockers
    currentStatus.blockers.forEach((blocker) => {
      if (!prevBlockersMap.has(blocker.id)) {
        newBlockers.push(blocker);
      }
    });

    // Detect resolved blockers
    this.previousStatus.blockers.forEach((blocker) => {
      const currentBlocker = currentStatus.blockers.find((b) => b.id === blocker.id);
      if (!currentBlocker) {
        resolvedBlockers.push(blocker.id);
      }
    });

    // Determine if this is a major change
    const majorChange = this.isMajorChange(this.previousStatus, currentStatus);

    // Store current status as previous for next comparison
    this.previousStatus = JSON.parse(JSON.stringify(currentStatus));

    return {
      taskUpdates,
      newBlockers,
      resolvedBlockers,
      majorChange,
    };
  }

  /**
   * Check if a task has changed
   */
  private hasTaskChanged(prevTask: Task, currentTask: Task): boolean {
    return (
      prevTask.status !== currentTask.status ||
      prevTask.title !== currentTask.title ||
      prevTask.prNumber !== currentTask.prNumber ||
      prevTask.completedAt !== currentTask.completedAt
    );
  }

  /**
   * Determine if this is a major structural change
   */
  private isMajorChange(prevStatus: ProjectStatus, currentStatus: ProjectStatus): boolean {
    // Major change if number of tracks changed
    if (prevStatus.tracks.length !== currentStatus.tracks.length) {
      return true;
    }

    // Major change if track IDs changed
    const prevTrackIds = new Set(prevStatus.tracks.map((t) => t.id));
    const currentTrackIds = new Set(currentStatus.tracks.map((t) => t.id));
    if (prevTrackIds.size !== currentTrackIds.size) {
      return true;
    }
    for (const id of currentTrackIds) {
      if (!prevTrackIds.has(id)) {
        return true;
      }
    }

    // Major change if total number of tasks changed significantly
    const taskDifference = Math.abs(prevStatus.totalTasks - currentStatus.totalTasks);
    if (taskDifference > 3) {
      return true;
    }

    return false;
  }

  /**
   * Get all tasks from a ProjectStatus
   */
  private getAllTasks(status: ProjectStatus): Task[] {
    const tasks: Task[] = [];
    status.tracks.forEach((track) => {
      tasks.push(...track.tasks);
    });
    return tasks;
  }

  /**
   * Extract "Last Updated" date from progress.md
   */
  private extractLastUpdated(content: string): string {
    const match = content.match(/\*\*Last Updated\*\*:\s*(.+)/);
    if (match) {
      const dateStr = match[1].trim();
      // Try to parse as ISO date, fallback to current time
      try {
        return new Date(dateStr).toISOString();
      } catch {
        return new Date().toISOString();
      }
    }
    return new Date().toISOString();
  }

  /**
   * Extract tracks and their tasks from progress.md
   */
  private extractTracks(content: string): Track[] {
    const tracksMap = new Map<string, Track>();

    // Regex to match task table rows
    // Format: | TASK-XXX | track | description | status | dependencies |
    const taskRegex = /\|\s*(TASK-\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;

    let match;
    while ((match = taskRegex.exec(content)) !== null) {
      const taskId = match[1].trim();
      const trackId = match[2].trim();
      const description = match[3].trim();
      const statusStr = match[4].trim();
      // dependencies column exists but not currently used in Task interface
      // const dependencies = match[5].trim();

      // Parse task status from status string
      const taskStatus = this.parseTaskStatus(statusStr);

      // Get or create track
      if (!tracksMap.has(trackId)) {
        tracksMap.set(trackId, {
          id: trackId,
          name: this.formatTrackName(trackId),
          agent: this.determineAgent(trackId),
          status: 'active' as TrackStatus,
          startedAt: new Date().toISOString(), // Will be updated if we find completion data
          progress: 0,
          completedTasks: 0,
          totalTasks: 0,
          tasks: [],
        });
      }

      const track = tracksMap.get(trackId)!;

      // Create task object
      const task: Task = {
        id: taskId,
        title: description,
        status: taskStatus,
        trackId: trackId,
      };

      // Try to extract additional task details from "Completed Task Details" section
      this.enrichTaskWithCompletionData(content, task);

      track.tasks.push(task);
    }

    // Calculate track statistics
    tracksMap.forEach((track) => {
      track.totalTasks = track.tasks.length;
      track.completedTasks = track.tasks.filter((t) => t.status === 'done').length;
      track.progress = track.totalTasks > 0
        ? Math.round((track.completedTasks / track.totalTasks) * 100)
        : 0;

      // Determine track status
      if (track.completedTasks === track.totalTasks && track.totalTasks > 0) {
        track.status = 'completed';
      } else if (track.tasks.some((t) => t.status === 'in_progress')) {
        track.status = 'active';
      } else {
        track.status = 'paused';
      }
    });

    return Array.from(tracksMap.values());
  }

  /**
   * Extract blockers from progress.md
   */
  private extractBlockers(content: string): Blocker[] {
    const blockers: Blocker[] = [];

    // Look for tasks with ⏳ Blocked or 🔴 Error status
    const taskRegex = /\|\s*(TASK-\d+)\s*\|[^|]*\|[^|]*\|\s*([^|]+)\s*\|/g;

    let match;
    while ((match = taskRegex.exec(content)) !== null) {
      const taskId = match[1].trim();
      const statusStr = match[2].trim();

      if (statusStr.includes('⏳') || statusStr.includes('Blocked') || statusStr.includes('🔴')) {
        blockers.push({
          id: `BLK-${taskId}`,
          taskId: taskId,
          reason: this.extractBlockerReason(content, taskId) || 'Unknown reason',
          blockedSince: new Date().toISOString(),
          impactedTasks: [],
          resolved: false,
        });
      }
    }

    return blockers;
  }

  /**
   * Determine overall project status
   */
  private determineOverallStatus(tracks: Track[], blockers: Blocker[]): string {
    // If there are unresolved blockers, status is Blocked
    if (blockers.some((b) => !b.resolved)) {
      return 'Blocked';
    }

    // If any track is active, project is In Progress
    if (tracks.some((t) => t.status === 'active')) {
      return 'In Progress';
    }

    // If all tracks are completed
    if (tracks.every((t) => t.status === 'completed') && tracks.length > 0) {
      return 'Completed';
    }

    // If all tracks are paused
    if (tracks.every((t) => t.status === 'paused') && tracks.length > 0) {
      return 'Paused';
    }

    return 'Unknown';
  }

  /**
   * Parse task status from status string
   */
  private parseTaskStatus(statusStr: string): TaskStatus {
    if (statusStr.includes('✅') || statusStr.includes('Done')) {
      return 'done';
    }
    if (statusStr.includes('🟡') || statusStr.includes('In Progress')) {
      return 'in_progress';
    }
    if (statusStr.includes('⏳') || statusStr.includes('Blocked')) {
      return 'blocked';
    }
    if (statusStr.includes('⚪') || statusStr.includes('Ready')) {
      return 'not_started';
    }
    return 'not_started';
  }

  /**
   * Format track ID to display name
   */
  private formatTrackName(trackId: string): string {
    const nameMap: Record<string, string> = {
      'mobile-app': 'Mobile App',
      'server': 'Server',
      'common': 'Common',
      'integration': 'Integration',
      'all': 'All Tracks',
    };
    return nameMap[trackId] || trackId;
  }

  /**
   * Determine agent from track ID
   */
  private determineAgent(trackId: string): string {
    const agentMap: Record<string, string> = {
      'mobile-app': 'Claude-1',
      'server': 'Claude-2',
      'common': 'Claude-1',
      'integration': 'Both',
      'all': 'Both',
    };
    return agentMap[trackId] || 'Unknown';
  }

  /**
   * Enrich task with completion data from "Completed Task Details" section
   */
  private enrichTaskWithCompletionData(content: string, task: Task): void {
    // Look for completion details section for this task
    const taskSectionRegex = new RegExp(
      `#### ${task.id}:[^#]*?(?:[\\s\\S]*?)(?=####|$)`,
      'i'
    );

    const match = content.match(taskSectionRegex);
    if (match) {
      const section = match[0];

      // Extract completion date
      const completedMatch = section.match(/- \*\*Completed\*\*:\s*([^\n]+)/i);
      if (completedMatch) {
        try {
          task.completedAt = new Date(completedMatch[1].trim()).toISOString();
        } catch {
          // Invalid date, ignore
        }
      }

      // Extract PR number
      const prMatch = section.match(/- \*\*PR\*\*:[^#]*?#(\d+)/i);
      if (prMatch) {
        task.prNumber = parseInt(prMatch[1], 10);
        task.prUrl = `https://github.com/invis/remote-cursor/pull/${task.prNumber}`;
      }
    }
  }

  /**
   * Extract blocker reason from content
   */
  private extractBlockerReason(content: string, taskId: string): string | null {
    // Try to find blocker information near the task
    const blockerRegex = new RegExp(`${taskId}[^\\n]*blocker[^\\n]*:?\\s*([^\\n]+)`, 'i');
    const match = content.match(blockerRegex);
    return match ? match[1].trim() : null;
  }

  /**
   * Count completed tasks across all tracks
   */
  private countCompletedTasks(tracks: Track[]): number {
    return tracks.reduce((sum, track) => sum + track.completedTasks, 0);
  }

  /**
   * Count total tasks across all tracks
   */
  private countTotalTasks(tracks: Track[]): number {
    return tracks.reduce((sum, track) => sum + track.totalTasks, 0);
  }

  /**
   * Return default status when parsing fails
   */
  private getDefaultStatus(): ProjectStatus {
    return {
      lastUpdated: new Date().toISOString(),
      tracks: [],
      blockers: [],
      overallStatus: 'Unknown',
      completedTasks: 0,
      totalTasks: 0,
    };
  }
}
