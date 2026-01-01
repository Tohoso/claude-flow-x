import fs from 'fs';
import { ProgressParser } from './progressParser';
import { ProjectStatus } from '@common/types';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProgressParser', () => {
  let parser: ProgressParser;
  const mockWatchDir = '/mock/watch/dir';

  beforeEach(() => {
    parser = new ProgressParser(mockWatchDir);
    jest.clearAllMocks();
  });

  describe('parseProgress', () => {
    it('should parse a complete progress.md with all information', () => {
      const mockContent = `# Remote Cursor - Development Progress

**Orchestrator**: Manus
**Last Updated**: 2025-01-01

## Current Sprint: Sprint 2

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-010 | common | 共有データモデルの定義 | ✅ Done | - |
| TASK-011 | server | サーバーサイドパーサーの強化 | 🟡 In Progress | TASK-010 |
| TASK-012 | mobile-app | モバイルアプリ状態管理の刷新 | ⚪ Ready | TASK-010 |

## Completed Task Details

#### TASK-010: 共有データモデルの定義 ✅
- **Completed**: 2025-01-01
- **PR**: #10 (Merged)
- **Summary**: Created shared type definitions
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result: ProjectStatus = parser.parseProgress();

      expect(result).toBeDefined();
      expect(result.tracks).toHaveLength(3);
      expect(result.overallStatus).toBe('In Progress');
      expect(result.completedTasks).toBe(1);
      expect(result.totalTasks).toBe(3);
      expect(result.blockers).toHaveLength(0);

      // Check common track
      const commonTrack = result.tracks.find((t) => t.id === 'common');
      expect(commonTrack).toBeDefined();
      expect(commonTrack!.name).toBe('Common');
      expect(commonTrack!.agent).toBe('Claude-1');
      expect(commonTrack!.status).toBe('completed');
      expect(commonTrack!.completedTasks).toBe(1);
      expect(commonTrack!.totalTasks).toBe(1);
      expect(commonTrack!.progress).toBe(100);

      // Check server track
      const serverTrack = result.tracks.find((t) => t.id === 'server');
      expect(serverTrack).toBeDefined();
      expect(serverTrack!.status).toBe('active');
      expect(serverTrack!.progress).toBe(0);

      // Check tasks
      const task010 = commonTrack!.tasks[0];
      expect(task010.id).toBe('TASK-010');
      expect(task010.status).toBe('done');
      expect(task010.prNumber).toBe(10);
    });

    it('should handle progress.md with blocked tasks', () => {
      const mockContent = `# Remote Cursor - Development Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-013 | mobile-app | Dashboard rebuild | ⏳ Blocked | TASK-012 |
| TASK-014 | server | API enhancement | 🔴 Error | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      expect(result.blockers).toHaveLength(2);
      expect(result.overallStatus).toBe('Blocked');

      const blocker1 = result.blockers.find((b) => b.taskId === 'TASK-013');
      expect(blocker1).toBeDefined();
      expect(blocker1!.resolved).toBe(false);

      const blocker2 = result.blockers.find((b) => b.taskId === 'TASK-014');
      expect(blocker2).toBeDefined();
    });

    it('should handle empty progress.md', () => {
      const mockContent = `# Remote Cursor - Development Progress

**Last Updated**: 2025-01-01
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      expect(result.tracks).toHaveLength(0);
      expect(result.blockers).toHaveLength(0);
      expect(result.overallStatus).toBe('Unknown');
      expect(result.completedTasks).toBe(0);
      expect(result.totalTasks).toBe(0);
    });

    it('should parse task status correctly', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ✅ Done | - |
| TASK-002 | server | Task 2 | 🟡 In Progress | - |
| TASK-003 | server | Task 3 | ⚪ Ready | - |
| TASK-004 | server | Task 4 | ⏳ Blocked | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      const serverTrack = result.tracks[0];
      expect(serverTrack.tasks[0].status).toBe('done');
      expect(serverTrack.tasks[1].status).toBe('in_progress');
      expect(serverTrack.tasks[2].status).toBe('not_started');
      expect(serverTrack.tasks[3].status).toBe('blocked');
    });

    it('should handle file read errors gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = parser.parseProgress();

      expect(result).toBeDefined();
      expect(result.tracks).toHaveLength(0);
      expect(result.overallStatus).toBe('Unknown');
    });

    it('should extract last updated date correctly', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ✅ Done | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      expect(result.lastUpdated).toBeDefined();
      const date = new Date(result.lastUpdated);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
    });

    it('should calculate track progress correctly', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | mobile-app | Task 1 | ✅ Done | - |
| TASK-002 | mobile-app | Task 2 | ✅ Done | - |
| TASK-003 | mobile-app | Task 3 | 🟡 In Progress | - |
| TASK-004 | mobile-app | Task 4 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      const mobileTrack = result.tracks[0];
      expect(mobileTrack.totalTasks).toBe(4);
      expect(mobileTrack.completedTasks).toBe(2);
      expect(mobileTrack.progress).toBe(50); // 2/4 * 100 = 50%
    });

    it('should determine track status correctly', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | track-completed | Task 1 | ✅ Done | - |
| TASK-002 | track-completed | Task 2 | ✅ Done | - |
| TASK-003 | track-active | Task 3 | 🟡 In Progress | - |
| TASK-004 | track-paused | Task 4 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      const completedTrack = result.tracks.find((t) => t.id === 'track-completed');
      expect(completedTrack!.status).toBe('completed');

      const activeTrack = result.tracks.find((t) => t.id === 'track-active');
      expect(activeTrack!.status).toBe('active');

      const pausedTrack = result.tracks.find((t) => t.id === 'track-paused');
      expect(pausedTrack!.status).toBe('paused');
    });

    it('should extract PR information from completed tasks', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-005 | server | Server task | ✅ Done | - |

## Completed Task Details

#### TASK-005: Server task ✅
- **Completed**: 2024-12-31
- **PR**: #5 (Merged)
- **Summary**: Implemented server functionality
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      const task = result.tracks[0].tasks[0];
      expect(task.prNumber).toBe(5);
      expect(task.prUrl).toContain('pull/5');
      expect(task.completedAt).toBeDefined();
    });

    it('should handle multiple tracks with different agents', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | mobile-app | Mobile task | ✅ Done | - |
| TASK-002 | server | Server task | ✅ Done | - |
| TASK-003 | integration | Integration task | ✅ Done | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      const mobileTrack = result.tracks.find((t) => t.id === 'mobile-app');
      expect(mobileTrack!.agent).toBe('Claude-1');

      const serverTrack = result.tracks.find((t) => t.id === 'server');
      expect(serverTrack!.agent).toBe('Claude-2');

      const integrationTrack = result.tracks.find((t) => t.id === 'integration');
      expect(integrationTrack!.agent).toBe('Both');
    });

    it('should determine overall status as Completed when all tracks done', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | mobile-app | Task 1 | ✅ Done | - |
| TASK-002 | server | Task 2 | ✅ Done | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      expect(result.overallStatus).toBe('Completed');
    });

    it('should determine overall status as Paused when all tracks paused', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | mobile-app | Task 1 | ⚪ Ready | - |
| TASK-002 | server | Task 2 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = parser.parseProgress();

      expect(result.overallStatus).toBe('Paused');
    });
  });

  describe('calculateDiff', () => {
    it('should detect task status changes', () => {
      // First parse - initial state
      const initialContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
| TASK-002 | server | Task 2 | ✅ Done | - |
`;

      mockFs.readFileSync.mockReturnValue(initialContent);
      const initialStatus = parser.parseProgress();
      parser.calculateDiff(initialStatus); // Establish baseline

      // Second parse - task status changed
      const updatedContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | 🟡 In Progress | - |
| TASK-002 | server | Task 2 | ✅ Done | - |
`;

      mockFs.readFileSync.mockReturnValue(updatedContent);
      const updatedStatus = parser.parseProgress();
      const diff = parser.calculateDiff(updatedStatus);

      expect(diff.taskUpdates).toHaveLength(1);
      expect(diff.taskUpdates[0].id).toBe('TASK-001');
      expect(diff.taskUpdates[0].status).toBe('in_progress');
      expect(diff.majorChange).toBe(false);
    });

    it('should detect new blockers', () => {
      // First parse - no blockers
      const initialContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(initialContent);
      const initialStatus = parser.parseProgress();
      parser.calculateDiff(initialStatus); // Establish baseline

      // Second parse - blocker added
      const updatedContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⏳ Blocked | - |
`;

      mockFs.readFileSync.mockReturnValue(updatedContent);
      const updatedStatus = parser.parseProgress();
      const diff = parser.calculateDiff(updatedStatus);

      expect(diff.newBlockers).toHaveLength(1);
      expect(diff.newBlockers[0].taskId).toBe('TASK-001');
      expect(diff.taskUpdates).toHaveLength(1); // Task status also changed
    });

    it('should detect resolved blockers', () => {
      // First parse - with blocker
      const initialContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⏳ Blocked | - |
`;

      mockFs.readFileSync.mockReturnValue(initialContent);
      const initialStatus = parser.parseProgress();
      parser.calculateDiff(initialStatus); // Establish baseline

      // Second parse - blocker resolved
      const updatedContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | 🟡 In Progress | - |
`;

      mockFs.readFileSync.mockReturnValue(updatedContent);
      const updatedStatus = parser.parseProgress();
      const diff = parser.calculateDiff(updatedStatus);

      expect(diff.resolvedBlockers).toHaveLength(1);
      expect(diff.resolvedBlockers[0]).toBe('BLK-TASK-001');
    });

    it('should detect major changes when tracks change', () => {
      // First parse - one track
      const initialContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(initialContent);
      const initialStatus = parser.parseProgress();
      parser.calculateDiff(initialStatus); // Establish baseline

      // Second parse - new track added
      const updatedContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
| TASK-002 | mobile-app | Task 2 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(updatedContent);
      const updatedStatus = parser.parseProgress();
      const diff = parser.calculateDiff(updatedStatus);

      expect(diff.majorChange).toBe(true);
    });

    it('should mark first parse as major change', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      const status = parser.parseProgress();

      // Clear previous status to simulate first parse
      const freshParser = new ProgressParser(mockWatchDir);
      const diff = freshParser.calculateDiff(status);

      expect(diff.majorChange).toBe(true);
      expect(diff.taskUpdates.length).toBeGreaterThan(0);
    });

    it('should not report changes when nothing changed', () => {
      const mockContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      const firstStatus = parser.parseProgress();
      parser.calculateDiff(firstStatus); // Establish baseline

      // Parse again with same content
      const status = parser.parseProgress();
      const diff = parser.calculateDiff(status);

      expect(diff.taskUpdates).toHaveLength(0);
      expect(diff.newBlockers).toHaveLength(0);
      expect(diff.resolvedBlockers).toHaveLength(0);
      expect(diff.majorChange).toBe(false);
    });

    it('should detect multiple task updates', () => {
      // First parse
      const initialContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | ⚪ Ready | - |
| TASK-002 | server | Task 2 | ⚪ Ready | - |
| TASK-003 | server | Task 3 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(initialContent);
      const initialStatus = parser.parseProgress();
      parser.calculateDiff(initialStatus); // Establish baseline

      // Second parse - multiple tasks changed
      const updatedContent = `# Progress

**Last Updated**: 2025-01-01

| Task | Track | Description | Status | Dependencies |
|:---|:---|:---|:---:|:---|
| TASK-001 | server | Task 1 | 🟡 In Progress | - |
| TASK-002 | server | Task 2 | ✅ Done | - |
| TASK-003 | server | Task 3 | ⚪ Ready | - |
`;

      mockFs.readFileSync.mockReturnValue(updatedContent);
      const updatedStatus = parser.parseProgress();
      const diff = parser.calculateDiff(updatedStatus);

      expect(diff.taskUpdates).toHaveLength(2);
      expect(diff.taskUpdates.map((t) => t.id)).toContain('TASK-001');
      expect(diff.taskUpdates.map((t) => t.id)).toContain('TASK-002');
    });
  });
});
