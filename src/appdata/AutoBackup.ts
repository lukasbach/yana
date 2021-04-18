import { DataInterface } from '../datasource/DataInterface';
import { WorkSpace } from '../types';
import { SettingsObject } from '../settings/types';
import * as fs from 'fs';
import { AppDataExportService } from './AppDataExportService';
import path from 'path';
import { LogService } from '../common/LogService';
import { DataSourceRegistry } from '../datasource/DataSourceRegistry';
import { TelemetryEvents } from '../components/telemetry/TelemetryEvents';
import { TelemetryService } from '../components/telemetry/TelemetryProvider';

const logger = LogService.getLogger('AutoBackup');

// TODO backup queueing is probably not required
// TODO inform user with toasts about finished backups?

export class AutoBackup {
  private lastBackup: number = 0;
  private nextBackup: number = 0;
  private timer: number | undefined;
  private backupIdentifier: string;

  constructor(
    public workspace: WorkSpace,
    private settings: SettingsObject,
    private queueBackup: (perform: () => Promise<any>) => void
  ) {
    this.backupIdentifier = workspace.name.toLowerCase().replace(/\s/g, '_');
  }

  public async load() {
    const dataInterface = new DataInterface(DataSourceRegistry.getDataSource(this.workspace), null as any, 300);
    await dataInterface.load();
    this.lastBackup = (await dataInterface.getStructure('backup'))?.lastBackup || 0;
    await dataInterface.unload();
    this.nextBackup = this.lastBackup + this.settings.autoBackupInterval;
    logger.log(
      `Loaded AutoBackups for ${this.workspace.name}. Last backup was ${new Date(
        this.lastBackup
      ).toLocaleString()}, next one is ${new Date(this.nextBackup).toLocaleString()}`
    );
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

    logger.log('Performing automatic backup for workspace', [this.workspace.name], { workspace: this.workspace });
    TelemetryService?.trackEvent(...TelemetryEvents.Backups.performBackup);

    const dataInterface = new DataInterface(DataSourceRegistry.getDataSource(this.workspace), null as any, 300);
    await dataInterface.load();

    const now = new Date();
    const dateIdentifier = `_${now.getTime()}__${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    await AppDataExportService.exportTo(
      path.join(this.settings.autoBackupLocation, `${this.backupIdentifier}_${dateIdentifier}.zip`),
      this.workspace,
      console.log
    );

    logger.log(`Finished backup ${this.backupIdentifier}. Now cleaning up...`);

    const numberOfExistingBackups = await this.countExistingBackups();
    const numberOfBackupsToKeep = this.settings.autoBackupCount;

    logger.log(
      `${this.backupIdentifier}: Currently, ${numberOfExistingBackups} backups exist, ${numberOfBackupsToKeep} should be kept.`
    );

    if (numberOfExistingBackups > numberOfBackupsToKeep) {
      logger.log(`${this.backupIdentifier}: Removing ${numberOfExistingBackups - numberOfBackupsToKeep} old backups.`);
      await this.removeOldestBackups(numberOfExistingBackups - numberOfBackupsToKeep);
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

  private async removeOldestBackups(numberOfBackupsToDelete: number) {
    if (!fs.existsSync(this.settings.autoBackupLocation)) return 0;
    const backups = await fs.promises.readdir(this.settings.autoBackupLocation);
    const backupsFromThisWorkspace = backups.filter(b => b.startsWith(this.backupIdentifier));
    const backupsSorted = backupsFromThisWorkspace.sort((a, b) => a.localeCompare(b));

    for (let i = 0; i < numberOfBackupsToDelete; i++) {
      const backupToPurge = backupsSorted[i];
      await fs.promises.unlink(path.join(this.settings.autoBackupLocation, backupToPurge));
    }
  }

  private scheduleNextBackup() {
    const nextBackup = Math.min(Date.now(), this.nextBackup - Date.now());
    logger.log(`Next automatic update for ${this.workspace.name} scheduled in ${nextBackup / 1000} seconds`);
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (nextBackup <= 100) {
      // effectively now
      this.queueBackup(() => this.performBackup());
    } else {
      this.timer = (setTimeout(() => this.queueBackup(() => this.performBackup()), nextBackup) as unknown) as number;
    }
  }
}
