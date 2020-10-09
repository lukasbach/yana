import { DataItem, DataItemKind, DataSourceActionResult, MediaItem, SearchQuery, UiError } from '../types';

export interface AbstractDataSource {
  load: () => Promise<DataSourceActionResult>;

  getDataItem: <K extends DataItemKind>(id: string) => Promise<null | DataItem<K>>;
  getNoteItemContent: <C extends object>(id: string) => Promise<C>;
  writeNoteItemContent: <C extends object>(id: string, content: C) => Promise<DataSourceActionResult>;
  createDataItem: <K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>) => Promise<DataItem<K>>;
  removeItem: (id: string) => Promise<DataSourceActionResult>;
  changeItem: <K extends DataItemKind>(id: string, overwriteItem: DataItem<K>) => Promise<DataSourceActionResult>;

  getParentsOf: <K extends DataItemKind>(childId: string) => Promise<DataItem<K>[]>;
  search: (search: SearchQuery, onFind: (result: Array<DataItem<any>>) => any) => Promise<DataSourceActionResult>;

  storeStructure: (id: string, structure: any) => Promise<DataSourceActionResult>;
  getStructure: (id: string) => Promise<any>;

  loadMediaItemContent: (id: string) => Promise<Buffer | Blob>;
  loadMediaItemContentAsPath: (id: string) => Promise<string>;
  storeMediaItemContent: (id: string, localPath: string, thumbnail?: { width?: number, height?: number }) => Promise<DataSourceActionResult>;
  loadMediaItemContentThumbnailAsPath: (id: string) => Promise<string | undefined>;
  removeMediaItemContent: (item: MediaItem) => Promise<DataSourceActionResult>;
  // storeMediaItemContent: (id: string, path: string)

  persist: () => Promise<DataSourceActionResult>;
}
