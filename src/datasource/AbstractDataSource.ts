import { DataItem, DataItemKind, DataSourceActionResult, MediaItem, SearchQuery, UiError } from '../types';

export interface AbstractDataSource {
  load: () => Promise<DataSourceActionResult>;

  getDataItem: <K extends DataItemKind>(id: string) => Promise<null | Omit<DataItem<K>, 'content'>>;
  getNoteItemContent: <C extends object>(id: string) => Promise<C>;
  writeNoteItemContent: <C extends object>(id: string, content: C) => Promise<DataSourceActionResult>;
  createDataItem: <K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>) => Promise<DataItem<K>>;
  removeItem: (id: string) => Promise<DataSourceActionResult>;
  changeItem: <K extends DataItemKind>(id: string, overwriteItem: DataItem<K>) => Promise<DataSourceActionResult>;

  search: (search: SearchQuery, onFind: (result: Array<DataItem<any>>) => any) => Promise<DataSourceActionResult>;

  loadMediaItemContent: (id: string) => Promise<Buffer | Blob>;

  persist: () => Promise<DataSourceActionResult>;
}
