import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import { ProjectStatus, ProjectStatusDiff } from '@common/types';
import { ProgressParser } from './progressParser';

export type StatusChangeCallback = (status: ProjectStatus, diff: ProjectStatusDiff) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private parser: ProgressParser;
  private watchDir: string;
  private callback: StatusChangeCallback | null = null;

  constructor(watchDir: string) {
    this.watchDir = watchDir;
    this.parser = new ProgressParser(watchDir);
  }

  /**
   * Start watching for file changes
   */
  public start(callback: StatusChangeCallback): void {
    this.callback = callback;

    const progressPath = path.join(this.watchDir, 'progress.md');

    console.log(`Starting file watcher for: ${progressPath}`);

    this.watcher = chokidar.watch(progressPath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath: string) => {
        console.log(`File added: ${filePath}`);
        this.handleChange();
      })
      .on('change', (filePath: string) => {
        console.log(`File changed: ${filePath}`);
        this.handleChange();
      })
      .on('unlink', (filePath: string) => {
        console.log(`File removed: ${filePath}`);
      })
      .on('error', (error: unknown) => {
        console.error('File watcher error:', error);
      });

    console.log('File watcher started successfully');
  }

  /**
   * Stop watching for file changes
   */
  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      console.log('File watcher stopped');
    }
  }

  /**
   * Handle file change event
   */
  private handleChange(): void {
    try {
      const status = this.parser.parseProgress();
      const diff = this.parser.calculateDiff(status);

      if (this.callback) {
        this.callback(status, diff);
      }
    } catch (error) {
      console.error('Error handling file change:', error);
    }
  }

  /**
   * Get current project status (without waiting for change)
   */
  public getCurrentStatus(): ProjectStatus {
    return this.parser.parseProgress();
  }
}
