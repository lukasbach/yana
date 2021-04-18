import { WorkSpace } from '../types';
import { SettingsObject } from '../settings/types';
import { AutoBackup } from './AutoBackup';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('AutoBackupService');

export class AutoBackupService {
  private backups: AutoBackup[] = [];
  private queuedBackups: Array<() => Promise<any>> = [];
  // TODO queued backups is probably not required anymore as multiple parallel exports are now supported
  private isDoingBackup = false;

  private queueBackup: (perform: () => Promise<any>) => void = perform => {
    this.queuedBackups.push(perform);
    if (!this.isDoingBackup) {
      this.isDoingBackup = true;
      this.performNextBackup();
    }
  };

  constructor(
    private workspaces: WorkSpace[],
    private settings: SettingsObject,
    private onFinishBackups: (time: number) => void
  ) {}

  public async load() {
    for (const workspace of this.workspaces) {
      const backup = new AutoBackup(workspace, this.settings, this.queueBackup);
      await backup.load();
      this.backups.push();
      logger.log('Loaded workspace', [workspace.name]);
    }
  }

  public async unload() {
    for (const backup of this.backups) {
      await backup.unload();
      logger.log('Unloaded workspace', [backup.workspace.name]);
    }
  }

  public async addWorkspace(workspace: WorkSpace) {
    const backup = new AutoBackup(workspace, this.settings, this.queueBackup);
    await backup.load();
    this.backups.push();
    logger.log('Added workspace', [workspace.name]);
  }

  public async removeWorkspace(workspace: WorkSpace) {
    const backup = this.backups.find(
      b => b.workspace.dataSourceOptions.sourcePath === workspace.dataSourceOptions.sourcePath
    );

    if (backup) {
      await backup.unload();
      this.backups = this.backups.filter(b => b !== backup);
    }
    logger.log('Removed workspace', [workspace.name]);
  }

  private async performNextBackup() {
    const backup = this.queuedBackups.pop();
    if (backup) {
      await backup();
      await this.performNextBackup();
    } else {
      this.isDoingBackup = false;
      this.onFinishBackups(Date.now());
    }
  }
}
