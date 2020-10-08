import { AbstractDataSource } from './AbstractDataSource';
import { DataSourceActionResult, DataItemKind, MediaItem, SearchQuery, DataItem } from '../types';
import * as fsLib from 'fs';
import * as path from 'path';
import { isMediaItem, isNoteItem } from '../utils';
import { SearchHelper } from './SearchHelper';
import Jimp from 'jimp/dist';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('LocalFileSystemDataSource');

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
    items: { [key: string]: DataItem<any> };
    structures: { [key: string]: any };
  };

  private thumbnailExtensions: string[] = [
    'png',
    'jpg',
    'gif',
    'jpeg',
    'bmp',
    'tiff'
  ]

  private resolvePath(...p: string[]) {
    return path.join(this.options.sourcePath, ...p);
  }

  private createId(name: string, counter?: number): string {
    let id = name
      .toLocaleLowerCase()
      .replace(/\s/g, '_')
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
    const mediaDataPath = path.join(sourcePath, MEDIA_DIR);

    if (!fsLib.existsSync(sourcePath)) {
      fsLib.mkdirSync(sourcePath, { recursive: true });
    }

    if (!fsLib.existsSync(noteDataPath)) {
      fsLib.mkdirSync(noteDataPath, { recursive: true });
    }

    if (!fsLib.existsSync(mediaDataPath)) {
      fsLib.mkdirSync(mediaDataPath, { recursive: true });
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
    let itemCopy: DataItem<K> = { ...item, id: (item as any).id || this.createId(item.name) };
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
    console.log("Search")

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

  public async loadMediaItemContentAsPath(id: string): Promise<string> {
    const mediaItem = this.structure.items[id] as MediaItem;
    return mediaItem.referencePath || this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension);
  }

  public async loadMediaItemContentThumbnailAsPath(id: string): Promise<string | undefined> {
    const mediaItem = this.structure.items[id] as MediaItem;
    if (this.thumbnailExtensions.includes(mediaItem.extension)) {
      const thumbnailPath = this.resolvePath(MEDIA_DIR, id + '.thumb.' + mediaItem.extension);
      if (fsLib.existsSync(thumbnailPath)) {
        return thumbnailPath;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public async storeMediaItemContent(id: string, localPath: string, thumbnail: { width?: number; height?: number } | undefined): Promise<DataSourceActionResult> {
    const mediaItem = this.structure.items[id] as MediaItem;
    logger.log("Storing media item content", [], {id, localPath, mediaItem, thumbnail});
    if (!mediaItem.referencePath) {
      fsLib.copyFileSync(localPath, this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension));
    }

    if (thumbnail && (thumbnail.width || thumbnail?.height) && this.thumbnailExtensions.includes(mediaItem.extension)) {
      logger.log("Preparing thumbnail", [], {thumbnail, mediaItem, localPath});
      const file = fsLib.readFileSync(localPath);
      const jimpImage = await Jimp.read(file);
      logger.log("Read original image", [], {jimpImage});
      const resized = await jimpImage.resize(thumbnail.width || Jimp.AUTO, thumbnail.height || Jimp.AUTO);
      const buffer = await resized.getBufferAsync(resized.getMIME());
      fsLib.writeFileSync(this.resolvePath(MEDIA_DIR, id + '.thumb.' + mediaItem.extension), buffer);
       // .writeAsync(this.resolvePath(MEDIA_DIR, id + '.thumb.' + mediaItem.extension));
      logger.log("Resized image and stored thumbnail", [], {});
    }
  }

  public async removeMediaItemContent(item: MediaItem): Promise<DataSourceActionResult> {
    const mediaPath = this.resolvePath(MEDIA_DIR, item.id + '.' + item.extension);
    const thumbPath = this.resolvePath(MEDIA_DIR, item.id + '.thumb.' + item.extension);
    logger.log("Removing media contents", [], {item, mediaPath, thumbPath, hasThumb: item.hasThumbnail});
    fsLib.unlinkSync(mediaPath);

    if (item.hasThumbnail) {
      fsLib.unlinkSync(thumbPath);
    }
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
