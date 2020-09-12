import { LocalFileSystemDataSourceOptions } from './datasource/LocalFileSystemDataSource';

export interface NamedIdentifiableItem<K extends IdentifiableItemKind> {
  id: string;
  name: string;
  kind: K;
}

export enum IdentifiableItemKind {
  NoteItem = 'note',
  Collection = 'collection',
  MediaItem = 'media'
}

export interface Taggable {
  tags: string[];
}

export interface HasParents {
  parentIds: string[]
}

export interface NoteItemCollection extends NamedIdentifiableItem<IdentifiableItemKind.Collection>, Taggable, HasParents {
}

export interface NoteItem<T extends string, C extends object> extends NamedIdentifiableItem<IdentifiableItemKind.NoteItem>, Taggable, HasParents {
  type: T;
  content: C;
  created: string;
  lastChange: string;
}

export interface MediaItem extends NamedIdentifiableItem<IdentifiableItemKind.MediaItem>, Taggable, HasParents {
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
  kind?: IdentifiableItemKind;
}

export interface WorkSpace {
  dataSourceType: 'fs';
  dataSourceOptions: LocalFileSystemDataSourceOptions;
  name: string;
}

export interface AppData {
  workspaces: WorkSpace[];
}
