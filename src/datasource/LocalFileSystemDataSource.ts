import { AbstractDataSource } from './AbstractDataSource';
import { DataSourceActionResult, DataItemKind, MediaItem, SearchQuery, DataItem } from '../types';
import * as fsLib from 'fs';
import * as path from 'path';
import { isMediaItem, isNoteItem } from '../utils';
import { SearchHelper } from './SearchHelper';

const fs = fsLib.promises;

const STRUCTURE_FILE = 'notebook.json';
const NOTES_DIR = 'notedata';
const MEDIA_DIR = 'media';
const UTF8 = 'utf8';

export interface LocalFileSystemDataSourceOptions {
  sourcePath: string;
}

export class LocalFileSystemDataSource implements AbstractDataSource {
  private structure!: {
    // notes: { [key: string]: Omit<NoteItem<any, any>, 'content'> };
    // collections: { [key: string]: NoteItemCollection };
    // mediaItems: { [key: string]: MediaItem };
    items: { [key: string]: DataItem<any> };
    structures: { [key: string]: any };
  };

  private resolvePath(...p: string[]) {
    return path.join(this.options.sourcePath, ...p);
  }

  private createId(name: string, counter?: number): string {
    let id = name
      .toLocaleLowerCase()
      .replace('\s', '_')
      .replace(/[^a-zA-Z ]/g, '');
    id += counter || '';

    if (!(id in this.structure.items)) {
      return id;
    } else {
      return this.createId(name, (counter || 1) + 1);
    }
  }

  constructor(private options: LocalFileSystemDataSourceOptions) {}

  public static async init(options: LocalFileSystemDataSourceOptions) {
    const sourcePath = options.sourcePath;
    const noteDataPath = path.join(sourcePath, NOTES_DIR);

    if (!fsLib.existsSync(sourcePath)) {
      fsLib.mkdirSync(sourcePath, { recursive: true });
    }

    if (!fsLib.existsSync(noteDataPath)) {
      fsLib.mkdirSync(noteDataPath, { recursive: true });
    }

    fsLib.writeFileSync(
      path.join(options.sourcePath, STRUCTURE_FILE),
      JSON.stringify({
        items: {}
      })
    );
  }

  public async load() {
    this.structure = JSON.parse(fsLib.readFileSync(this.resolvePath(STRUCTURE_FILE), { encoding: UTF8 }));
  }

  public async getDataItem<K extends DataItemKind>(id: string): Promise<DataItem<K> | null> {
    return this.structure.items[id] || null;
  }

  public async getNoteItemContent<C extends object>(id: string): Promise<C> {
    const content = fsLib.readFileSync(this.resolvePath(NOTES_DIR, id + '.json'), { encoding: UTF8 });
    return JSON.parse(content);
  }

  public async writeNoteItemContent<C extends object>(id: string, content: C): Promise<DataSourceActionResult> {
    fsLib.writeFileSync(this.resolvePath(NOTES_DIR, id + '.json'), JSON.stringify(content));
  }

  public async createDataItem<K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>): Promise<DataItem<K>> {
    let itemCopy: DataItem<K> = { ...item, id: this.createId(item.name) };
    this.structure.items[itemCopy.id] = itemCopy;
    return itemCopy;
  }

  public async removeItem(id: string): Promise<DataSourceActionResult> {
    const item = this.structure.items[id];

    if (isNoteItem(item)) {
      fsLib.unlinkSync(this.resolvePath(NOTES_DIR, id + '.json'));
    } else if (isMediaItem(item)) {
      fsLib.unlinkSync(this.resolvePath(MEDIA_DIR, id + '.' + item.extension));
    }

    delete this.structure.items[id];
  }

  public async changeItem(id: string, overwriteItem: DataItem<any>): Promise<DataSourceActionResult> {
    this.structure.items[id] = {
      ...overwriteItem,
      content: undefined,
    } as any;
  }

  public async search(
    search: SearchQuery,
    onFind: (collections: Array<DataItem<any>>) => any
  ): Promise<DataSourceActionResult> {
    const result: DataItem[] = [];

    for (const item of Object.values(this.structure.items)) {
      if (await SearchHelper.satisfiesSearch(item, search, this)) {
        result.push(item);
      }
    }

    onFind(result);
  }

  public async loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    const mediaItem = this.structure.items[id] as MediaItem;
    return fsLib.readFileSync(this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension));
  }

  public async persist() {
    fsLib.writeFileSync(this.resolvePath(STRUCTURE_FILE), JSON.stringify(this.structure, null, 1));
  }

  public async getParentsOf<K extends DataItemKind>(childId: string): Promise<DataItem<K>[]> {
    return Object.values(this.structure.items).filter(item => item.childIds.includes(childId));
  }

  public async storeStructure(id: string, structure: any): Promise<DataSourceActionResult> {
    if (!this.structure.structures) this.structure.structures = {};
    this.structure.structures[id] = structure;
  }

  public async getStructure(id: string): Promise<any> {
    if (!this.structure.structures) this.structure.structures = {};
    return this.structure.structures[id];
  }
}
