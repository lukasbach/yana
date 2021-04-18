import fs from 'fs';
import { appDataFile, userDataFolder } from './paths';
import { AppData } from '../types';
import { AppDataExportService } from './AppDataExportService';
import { LogService } from '../common/LogService';
import path from 'path';
import { autoUpdater } from 'electron-updater';

const logger = LogService.getLogger('AutoUpdate');

export class AutoUpdate {
  private shouldAutoUpdate: boolean = false;
  private shouldBackupBefore: boolean = false;
  private appData!: AppData;

  constructor() {
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.autoDownload = false;
  }

  async load() {
    if (fs.existsSync(userDataFolder)) {
      const appData: AppData = JSON.parse(await fs.promises.readFile(appDataFile, { encoding: 'utf8' }));
      this.shouldAutoUpdate = appData.settings.autoUpdateAppActive;
      this.shouldBackupBefore = appData.settings.autoUpdateAppBackupActive;
      this.appData = appData;
    }
  }

  async runAutoUpdateIfSettingsSet() {
    if (this.shouldAutoUpdate) {
      await this.prepareDownloadUpdate();
      await autoUpdater.checkForUpdates();
    }
  }

  async prepareDownloadUpdate() {
    autoUpdater.once('update-available', async () => {
      logger.log('Update is available. Initiate update.');

      if (this.shouldBackupBefore) {
        for (const ws of this.appData.workspaces) {
          const dest = path.join(
            this.appData.settings.autoBackupLocation,
            `backup_before_update__${ws.name.toLowerCase().replace(/\s/g, '-')}__${Date.now()}.zip`
          );
          logger.log(`Backing up ${ws.name} to ${dest}`);
          await AppDataExportService.exportTo(dest, ws, logger.log);
          logger.log('Finished backing up ', [ws.name]);
        }
      }

      logger.log('Starting update.');
      autoUpdater.logger = {
        info: msg => logger.log(JSON.stringify(msg)),
        warn: msg => logger.warn(JSON.stringify(msg)),
        error: msg => logger.error(JSON.stringify(msg)),
        debug: msg => logger.debug(JSON.stringify(msg)),
      };
      await autoUpdater.downloadUpdate();
      logger.log('Done with checkForUpdatesAndNotify().');
    });

    autoUpdater.once('update-not-available', async () => {
      logger.log('No update available');
    });

    autoUpdater.on('update-downloaded', () => {
      // Do nothing for now
      // autoUpdater.quitAndInstall();
    });
  }
}
