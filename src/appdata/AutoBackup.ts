import { DataInterface } from '../datasource/DataInterface';
import { WorkSpace } from '../types';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { SettingsObject } from '../settings/types';
import * as fs from 'fs';
import { AppDataExportService } from './AppDataExportService';
import path from 'path';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('AutoBackup');

export class AutoBackup {
  private lastBackup: number = 0;
  private nextBackup: number = 0;
  private timer: number | undefined;
  private backupIdentifier: string;

  constructor(
    public workspace: WorkSpace,
    private settings: SettingsObject,
    private queueBackup: (perform: () => Promise<any>) => void,
  ) {
    this.backupIdentifier = workspace.name.toLowerCase().replace(/\s/g, '_');
  }

  public async load() {
    const dataInterface = new DataInterface(new LocalFileSystemDataSource(this.workspace.dataSourceOptions), null as any, 300);
    await dataInterface.load();
    this.lastBackup = (await dataInterface.getStructure('backup'))?.lastBackup || 0;
    await dataInterface.unload();
    this.nextBackup = this.lastBackup + this.settings.autoBackupInterval;
    this.scheduleNextBackup();
  }

  public async unload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async performBackup() {
    if (!this.settings.autoBackupActive) {
      return;
    }

    logger.log("Performing automatic backup for workspace", [this.workspace.name], {workspace: this.workspace});

    const dataInterface = new DataInterface(new LocalFileSystemDataSource(this.workspace.dataSourceOptions), null as any, 300);
    await dataInterface.load();

    const now = new Date();
    const dateIdentifier = `_${now.getTime()}__${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    await AppDataExportService.exportTo(
      path.join(this.settings.autoBackupLocation, `${this.backupIdentifier}_${dateIdentifier}.zip`),
      this.workspace,
      console.log
    )

    if (await this.countExistingBackups() > this.settings.autoBackupCount) {
      await this.removeOldestBackup();
    }

    this.lastBackup = Date.now();
    this.nextBackup = this.lastBackup + this.settings.autoBackupInterval;
    await dataInterface.storeStructure('backup', { lastBackup: this.lastBackup });
    await dataInterface.persist();
    await dataInterface.unload();
    this.scheduleNextBackup();
  }

  private async countExistingBackups() {
    if (!fs.existsSync(this.settings.autoBackupLocation)) return 0;

    const backups = await fs.promises.readdir(this.settings.autoBackupLocation);

    const backupsFromThisWorkspace = backups.filter(b => b.startsWith(this.backupIdentifier));
    return backupsFromThisWorkspace.length;
  }

  private async removeOldestBackup() {
    if (!fs.existsSync(this.settings.autoBackupLocation)) return 0;
    const backups = await fs.promises.readdir(this.settings.autoBackupLocation);
    const backupsFromThisWorkspace = backups.filter(b => b.startsWith(this.backupIdentifier));
    const backupToPurge = backupsFromThisWorkspace.sort((a, b) => a.localeCompare(b))[0];
    await fs.promises.unlink(path.join(this.settings.autoBackupLocation, backupToPurge));
  }

  private scheduleNextBackup() {
    const nextBackup = Math.min(Date.now(), this.nextBackup - Date.now());
    logger.log(`Next automatic update for ${this.workspace.name} scheduled in ${nextBackup / 1000} seconds`);
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setTimeout(
      () => this.queueBackup(() => this.performBackup()),
      nextBackup
    ) as unknown as number;
  }


}