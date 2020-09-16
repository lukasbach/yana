import { LocalFileSystemDataSourceOptions } from './datasource/LocalFileSystemDataSource';

export enum DataItemKind {
  NoteItem = 'note',
  Collection = 'collection',
  MediaItem = 'media',
}

export interface DataItem<K extends DataItemKind = any> {
  id: string;
  name: string;
  kind: K;
  tags: string[];
  childIds: string[];
  created: number;
  lastChange: number;
}

export interface NoteDataItem<T extends string, C extends object> extends DataItem<DataItemKind.NoteItem> {
  noteType: T;
  content: C;
}

export interface CollectionDataItem extends DataItem<DataItemKind.Collection> {}

export interface MediaItem extends DataItem<DataItemKind.MediaItem> {
  added: string;
  size: number;
  type: 'image' | 'text' | 'folder';
  extension: string;
}

export class UiError extends Error {
  details?: string;
  object?: any;
}

export class ItemNotFoundError extends UiError {}

export type DataSourceActionResult = void;

export interface SearchQuery {
  contains?: string[];
  tags?: string[];
  parents?: string[];
  exactParents?: string[];
  childs?: string[];
  kind?: DataItemKind;
}

export interface WorkSpace {
  dataSourceType: 'fs';
  dataSourceOptions: LocalFileSystemDataSourceOptions;
  name: string;
}

export interface AppData {
  workspaces: WorkSpace[];
}
