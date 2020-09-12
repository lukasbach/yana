import { AbstractDataSource } from './AbstractDataSource';
import {
  DataSourceActionResult,
  IdentifiableItemKind,
  MediaItem,
  NoteItem,
  NoteItemCollection,
  SearchQuery,
} from '../types';
import * as fsLib from 'fs';
import * as path from 'path';

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
    items: { [key: string]: Omit<NoteItem<any, any>, 'content'> | NoteItemCollection | MediaItem }
  };

  private resolvePath(...p: string[]) {
    return path.join(this.options.sourcePath, ...p);
  }

  private createId(name: string, counter?: number): string {
    let id = name
      .toLocaleLowerCase()
      .replace(' ', '_')
      .replace(/[^a-zA-Z ]/g, "");
    id += counter || '';

    if (!(id in this.structure.items)) {
      return id;
    } else {
      return this.createId(name, (counter || 1) + 1);
    }
  }

  constructor(private options: LocalFileSystemDataSourceOptions) {
  }

  public static async init(options: LocalFileSystemDataSourceOptions) {
    await fs.writeFile(path.join(options.sourcePath, STRUCTURE_FILE), JSON.stringify({
      notes: {}, collections: {}, mediaItems: {}
    }));
  }

  public async load() {
    this.structure = JSON.parse(await fs.readFile(this.resolvePath(STRUCTURE_FILE), { encoding: UTF8 }));
  }

  public async getNoteItem<T extends string, C extends object>(id: string): Promise<Omit<NoteItem<T, C>, 'content'>> {
    return this.structure.items[id] as any;
  }

  public async getNoteItemContent<T extends string, C extends object>(id: string): Promise<NoteItem<T, C>> {
    const content = await fs.readFile(this.resolvePath(NOTES_DIR, id + '.json'), { encoding: UTF8 });
    return {
      ...this.structure.items[id] as any,
      content: JSON.parse(content)
    };
  }

  public async getCollection(id: string): Promise<NoteItemCollection> {
    return this.structure.items[id] as any;
  }

  public async createCollection(name: string): Promise<NoteItemCollection> {
    const item: NoteItemCollection = {
      id: this.createId(name),
      kind: IdentifiableItemKind.Collection,
      tags: [],
      parentIds: [],
      name
    };

    this.structure.items[item.id] = item;
    return item;
  }

  public async createNoteItem<T extends string, C extends object>(item: Omit<NoteItem<T, C>, "id">): Promise<NoteItem<T, C>> {
    let itemCopy: NoteItem<T, C> = {...item, id: this.createId(item.name)};
    this.structure.items[itemCopy.id] = itemCopy;
    return itemCopy;
  }

  public async changeItem(id: string, overwriteItem: NoteItem<any, any>): Promise<DataSourceActionResult> {
    this.structure.items[id] = {
      ...overwriteItem,
      content: undefined
    } as any;
    await fs.writeFile(this.resolvePath(NOTES_DIR, id + '.json'), JSON.stringify(overwriteItem.content));
  }

  public async changeItemTags(id: string, tags: string[]): Promise<DataSourceActionResult> {
    this.structure.items[id].tags = tags;
  }

  public async getMediaItem(id: string): Promise<MediaItem> {
    return this.structure.items[id] as any;
  }

  public async loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    const mediaItem = this.structure.items[id] as MediaItem;
    return await fs.readFile(this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension));
  }

  public async removeItem(id: string): Promise<DataSourceActionResult> {
    const item = this.structure.items[id];

    switch (item.kind) {
      case IdentifiableItemKind.MediaItem:
        await fs.unlink(this.resolvePath(MEDIA_DIR, id + '.' + item.extension));
        break;
      case IdentifiableItemKind.NoteItem:
        await fs.unlink(this.resolvePath(NOTES_DIR, id + '.json'));
        break;
      default:
        break;
    }

    delete this.structure.items[id];
  }

  public async renameItem(id: string, newName: string): Promise<DataSourceActionResult> {
    this.structure.items[id].name = newName;
  }

  public async search(search: SearchQuery, onFind: (collections: Array<Omit<NoteItem<any, any>, 'content'> | NoteItemCollection | MediaItem>) => any): Promise<DataSourceActionResult> {
    onFind(
      Object.values(this.structure.items).filter(item => {
        if (search.kind && search.kind !== item.kind) {
          return false;
        }

        if (search.parents && !search.parents.map(p => item.parentIds.includes(p)).reduce((a, b) => a && b, true)) {
          return false;
        }

        if (search.tags && !search.tags.map(t => item.tags.includes(t)).reduce((a, b) => a && b, true)) {
          return false;
        }

        if (search.contains && !search.contains.map(c => item.name.includes(c)).reduce((a, b) => a || b, false)) {
          return false;
        }
      })
    );
  }

  public async persist() {
    await fs.writeFile(this.resolvePath(STRUCTURE_FILE), JSON.stringify(this.structure));
  }
}