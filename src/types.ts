import { LocalFileSystemDataSourceOptions } from './datasource/LocalFileSystemDataSource';
import { SettingsObject } from './settings/types';

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
  icon?: string;
  color?: string;
}

export interface NoteDataItem<T extends string> extends DataItem<DataItemKind.NoteItem> {
  noteType: T;
}

export interface CollectionDataItem extends DataItem<DataItemKind.Collection> {}

export interface MediaItem extends DataItem<DataItemKind.MediaItem> {
  referencePath?: string;
  size: number;
  type: 'image' | 'text' | 'folder';
  extension: string;
  hasThumbnail: boolean;
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
  notTags?: string[];
  parents?: string[];
  exactParents?: string[];
  childs?: string[];
  kind?: DataItemKind;
  all?: boolean;
}

export interface WorkSpace {
  dataSourceType: 'fs';
  dataSourceOptions: LocalFileSystemDataSourceOptions;
  name: string;
}

export interface AppData {
  workspaces: WorkSpace[];
  settings: SettingsObject;
}
