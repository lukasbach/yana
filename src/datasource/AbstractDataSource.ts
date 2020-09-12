import { DataSourceActionResult, MediaItem, NoteItem, NoteItemCollection, SearchQuery, UiError } from '../types';

export interface AbstractDataSource {
  load: () => Promise<DataSourceActionResult>;

  getNoteItem: <T extends string, C extends object>(id: string) => Promise<Omit<NoteItem<T, C>, 'content'>>;
  getNoteItemContent: <T extends string, C extends object>(id: string) => Promise<NoteItem<T, C>>;
  createNoteItem: <T extends string, C extends object>(item: Omit<NoteItem<T, C>, 'id'>) => Promise<NoteItem<T, C>>;

  getCollection: (id: string) => Promise<NoteItemCollection>;
  createCollection: (name: string) => Promise<NoteItemCollection>;

  renameItem: (id: string, newName: string) => Promise<DataSourceActionResult>;
  removeItem: (id: string) => Promise<DataSourceActionResult>;

  changeItemTags: (id: string, tags: string[]) => Promise<DataSourceActionResult>;
  changeItem: (id: string, overwriteItem: NoteItem<any, any>) => Promise<DataSourceActionResult>;

  search: (
    search: SearchQuery,
    onFind: (collections: Array<Omit<NoteItem<any, any>, 'content'> | NoteItemCollection | MediaItem>) => any,
  ) => Promise<DataSourceActionResult>;

  getMediaItem: (id: string) => Promise<MediaItem>;
  loadMediaItemContent: (id: string) => Promise<Buffer | Blob>;

  persist: () => Promise<DataSourceActionResult>;
}
