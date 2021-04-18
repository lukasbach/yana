import { WorkSpace } from '../types';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { LocalSqliteDataSource } from './LocalSqliteDataSource';
import type { TelemetryContextValue } from '../components/telemetry/TelemetryProvider';

export class DataSourceRegistry {
  public static getDataSource(workspace: WorkSpace, telemetry?: TelemetryContextValue) {
    switch (workspace.dataSourceType) {
      case 'fs':
        return new LocalFileSystemDataSource(workspace.dataSourceOptions);
      case 'sqlite3':
        return new LocalSqliteDataSource(workspace.dataSourceOptions);
    }
  }

  public static async initDataSource(workspace: WorkSpace) {
    switch (workspace.dataSourceType) {
      case 'fs':
        return await LocalFileSystemDataSource.init(workspace.dataSourceOptions);
      case 'sqlite3':
        return await LocalSqliteDataSource.init(workspace.dataSourceOptions);
    }
  }
}
