import { AbstractDataSource } from './AbstractDataSource';
import path from 'path';
import {
  DataItem,
  DataItemKind,
  DataSourceActionResult,
  MediaItem,
  SearchQuery,
  SearchQuerySortColumn,
  SearchQuerySortDirection,
  SearchResult,
} from '../types';
import Knex from 'knex';
import fsLib from 'fs';
import { LocalFileSystemDataSourceOptions } from './LocalFileSystemDataSource';
import { LogService } from '../common/LogService';
import sqlite3 from 'sqlite3';
import { v4 as uuid } from 'uuid';
import { arrayDiff, isMediaItem, isNoteItem } from '../utils';
import Jimp from 'jimp/dist';

const fs = fsLib.promises;

const logger = LogService.getLogger('LocalSqliteDataSource');

const NOTEBOOK_FILE = 'notebook.json';
const DB_FILE = 'notebook.sqlite'
const MEDIA_DIR = 'media';
const UTF8 = 'utf8';

export interface LocalSqliteDataSourceOptions {
  sourcePath: string;
}

export class LocalSqliteDataSource implements AbstractDataSource {
  private db!: Knex<any, unknown[]>;
  private structures: any = {};

  private thumbnailExtensions: string[] = [
    'png',
    'jpg',
    'gif',
    'jpeg',
    'bmp',
    'tiff'
  ];

  private resolvePath(...p: string[]) {
    return path.join(this.options.sourcePath, ...p);
  }

  private createId(): string {
    return uuid();
  }

  public static getDb(sourcePath: string) {
    return Knex({
      client: "sqlite3",
      connection: {
        filename: path.join(sourcePath, DB_FILE)
      },
      useNullAsDefault: true
    });
  }

  private static async createSchemas(db: Knex) {
    await db.schema
      .createTable('items', table => {
        table.string('id').notNullable().primary().unique().index();
        table.string('name').notNullable();
        table.integer('created').notNullable();
        table.integer('lastChange').notNullable();
        table.enu('kind', [ 'collection', 'note', 'media' ]).defaultTo('note').notNullable();
        table.string('noteType').nullable();
        table.string('icon').nullable();
        table.string('color').nullable();
      })
      .createTable('items_tags', table => {
        table.increments('id').notNullable().unique().primary().index();
        table.string('tagName').notNullable().index();
        table.string('noteId').index().references('id').inTable('items');
      })
      .createTable('items_childs', table => {
        table.increments('id').notNullable().unique().primary().index();
        table.string('parentId').references('id').inTable('items');
        table.string('childId').references('id').inTable('items');
      })
      .createTable('media_data', table => {
        table.string('noteId').primary().unique().index().references('id').inTable('items');
        table.string('type').notNullable();
        table.string('extension').notNullable();
        table.integer('size').notNullable();
        table.boolean('hasThumbnail').notNullable();
        table.string('referencePath').nullable();
      })
      // .createTable('tags_all', table => {  // TODO not required?
      //   table.string('name').notNullable().unique().primary().index();
      //   table.integer('usage').defaultTo(0);
      // })
      .createTable('note_contents', table => {
        table.string('noteId').primary().index().unique().references('id').inTable('items');
        table.string('content');
      });
  }

  constructor(private options: LocalSqliteDataSourceOptions) {
    this.db = LocalSqliteDataSource.getDb(options.sourcePath);
  }

  public static async init(options: LocalFileSystemDataSourceOptions) {
    const sourcePath = options.sourcePath;
    const mediaDataPath = path.join(sourcePath, MEDIA_DIR);

    if (!fsLib.existsSync(sourcePath)) {
      await fs.mkdir(sourcePath, { recursive: true });
    }

    if (!fsLib.existsSync(mediaDataPath)) {
      await fs.mkdir(mediaDataPath, { recursive: true });
    }

    await new Promise(res => {
      new sqlite3.Database(
        path.join(sourcePath, DB_FILE),
        sqlite3.OPEN_CREATE,
        () => res()
      );
    });

    const db = LocalSqliteDataSource.getDb(sourcePath);
    await LocalSqliteDataSource.createSchemas(db);
    await db.destroy();

    await fs.writeFile(
      path.join(options.sourcePath, NOTEBOOK_FILE),
      JSON.stringify({ structures: {} }),
    );
  }

  public async load(): Promise<DataSourceActionResult> {
    this.structures = JSON.parse(await fs.readFile(this.resolvePath(NOTEBOOK_FILE), { encoding: 'utf8' })).structures;
  }

  public async unload(): Promise<DataSourceActionResult> {
    await this.db.destroy();
  }

  public reload(): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public async getDataItem<K extends DataItemKind>(id: string): Promise<DataItem<K> | null> {
    const [item] = await this.db('items')
      .select('*')
      .where('id', id)
      .limit(1);

    if (!item) {
      return null;
    }

    const tags: Array<{ tagName: string }> = await this.db('items_tags')
      .select('tagName', 'noteId')
      .where('noteId', id);

    const childIds: Array<{ childId: string }> = await this.db('items_childs')
      .select('parentId', 'childId')
      .where('parentId', id);

    // TODO joined query?

    return {
      ...item,
      childIds: childIds.map(child => child.childId),
      tags: tags.map(tag => tag.tagName)
    };
  }

  public async getNoteItemContent<C extends object>(id: string): Promise<C> {
    const [item] = await this.db('note_contents')
      .select('content', 'noteId')
      .where('noteId', id)
      .limit(1);

    return item?.content ? JSON.parse(item.content) : null;
  }

  public async writeNoteItemContent<C extends object>(id: string, content: C): Promise<DataSourceActionResult> {
    await this.db('note_contents')
      .where('noteId', id)
      .update('content', JSON.stringify(content));
  }

  public async createDataItem<K extends DataItemKind>(item: Omit<DataItem<K>, "id">): Promise<DataItem<K>> {
    const id = this.createId();
    await this.db('items').insert([{
      id: id,
      name: item.name,
      kind: item.kind,
      created: item.created,
      lastChange: item.lastChange,
      icon: item.icon,
      color: item.color,
      noteType: (item as any).noteType
    }]);

    if (item.tags.length > 0) {
      await this.db('items_tags').insert(item.tags.map(tag => ({
        tagName: tag,
        noteId: id
      })));
    }

    if (item.childIds.length > 0) {
      await this.db('items_childs').insert(item.childIds.map(childId => ({
        parentId: id,
        childId
      })));
    }

    if (isNoteItem(item as any)) {
      await this.db('note_contents').insert([{
        noteId: id,
        content: '{}'
      }]);
    } else if (isMediaItem(item as any)) {
      // TODO
    }

    return { ...item, id };
  }

  public async removeItem(id: string): Promise<DataSourceActionResult> {
    const item = await this.getDataItem(id);

    if (!item) {
      return;
    }

    if (isNoteItem(item)) {
      await this.db('note_contents')
        .where('noteId', id)
        .del();
    } else if (isMediaItem(item)) {
      // TODO
    }

    await this.db('items')
      .where('id', id)
      .del();
  }

  public async changeItem<K extends DataItemKind>(id: string, overwriteItem: DataItem<K>): Promise<DataSourceActionResult> {
    const item = await this.getDataItem(id);

    if (!item) {
      throw Error(`Trying to change item ${id}, which does not exist.`);
    }

    const removedTags = !overwriteItem.tags ? [] : arrayDiff(item.tags, overwriteItem.tags);
    const addedTags = !overwriteItem.tags ? [] : arrayDiff(overwriteItem.tags, item.tags);
    const removedChilds = !overwriteItem.childIds ? [] : arrayDiff(item.childIds, overwriteItem.childIds);
    const addedChilds = !overwriteItem.childIds ? [] : arrayDiff(overwriteItem.childIds, item.childIds);

    logger.log("Updating tags and childs", [], {addedTags, removedTags, addedChilds, removedChilds});

    if (addedTags.length > 0) {
      await this.db('items_tags').insert(addedTags.map(tag => ({
        tagName: tag,
        noteId: id
      })));
    }

    if (removedTags.length > 0) {
      await this.db('items_tags')
        .where('noteId', id)
        .and
        .whereIn('tagName', removedTags)
        .del();
    }

    if (addedChilds.length > 0) {
      await this.db('items_childs').insert(addedChilds.map(childId => ({
        parentId: id,
        childId,
      })));
    }

    if (removedChilds.length > 0) {
      await this.db('items_childs')
        .where('parentId', id)
        .and
        .whereIn('childId', removedChilds)
        .del();
    }

    await this.db('items')
      .where('id', id)
      .update({
        name: overwriteItem.name ?? item.name,
        created: overwriteItem.created ?? item.created,
        lastChange: overwriteItem.lastChange ?? item.lastChange,
        kind: overwriteItem.kind ?? item.kind,
        noteType: (overwriteItem as any).noteType ?? (item as any).noteType,
        icon: overwriteItem.icon ?? item.icon,
        color: overwriteItem.color ?? item.color
      });
  }

  public async getParentsOf<K extends DataItemKind>(childId: string): Promise<DataItem<K>[]> {
    // TODO transform to use join
    const parentIds: Array<{ parentId: string }> = await this.db('items_childs')
      .select('*')
      .where('childId', childId);

    return (await Promise.all(parentIds.map(({ parentId }) => this.getDataItem(parentId)))).filter(el => !!el) as any;
  }

  public async search(search: SearchQuery): Promise<SearchResult> {
    let query = this.db('items')
      .select('*');

    if (search.contains) {
      query = query.where(qb => {
        for (const contains of search.contains!) {
          qb.orWhere('name', 'like', `%${contains}%`);
        }
      });
    }

    if (search.kind) {
      query = query.andWhere('kind', search.kind);
    }

    if (search.tags) {
      for (const tag of search.tags) {
        query = query.whereExists(
          this.db('items_tags')
            .select('*')
            .whereRaw(`items_tags.tagName = "${tag}"`)
            .andWhereRaw(`items_tags.noteId = items.id`)
        );
      } // TODO maybe this for loop can be compressed into a single where clause?
    }

    if (search.notTags) {
      for (const tag of search.notTags) {
        query = query.whereNotExists(
          this.db('items_tags')
            .select('*')
            .whereRaw(`items_tags.tagName = "${tag}"`)
            .andWhereRaw(`items.id = items_tags.noteId`)
        );
      } // TODO maybe this for loop can be compressed into a single where clause?
    }

    if (search.childs) {
      // TODO implement
      // TODO and instead of or?
      // query = query.where(qb => {
      //   for (const child of search.childs!) {
      //     qb = query.orWhereIn(
      //       'id',
      //       this.db('parentId').where('childId', child).from('items_childs')
      //     )
      //   } // TODO maybe this for loop can be compressed into a single where clause?
      // });
    }

    if (search.parents) {
      query = query.where(qb => {
        for (const parent of search.parents!) {
          qb.orWhereExists(
            this.db('items_childs')
              .select('*')
              .whereRaw(`items_childs.parentId = "${parent}"`)
              .andWhereRaw(`items_childs.childId = items.id`)
          );
        }
      })
      // query = query.where(qb => {
      //   for (const parent of search.parents!) {
      //     qb = query.orWhereIn(
      //       'id',
      //       this.db('childId').where('parentId', parent).from('items_childs')
      //     )
      //   } // TODO maybe this for loop can be compressed into a single where clause?
      // });
    }

    if (search.exactParents) {
      for (const parent of search.exactParents) {
        query = query.whereExists(
          this.db('items_childs')
            .select('*')
            .whereRaw(`items_childs.parentId = "${parent}"`)
            .andWhereRaw(`items_childs.childId = items.id`)
        );

        // query = query.whereIn(
        //   'id',
        //   this.db('childId').where('parentId', parent).from('items_childs')
        // )
      } // TODO maybe this for loop can be compressed into a single where clause?
    }

    if (search.pagingValue) {
      query = query.where(
        search.sortColumn ?? SearchQuerySortColumn.Name,
        search.sortDirection === SearchQuerySortDirection.Descending ? '<' : '>', // TODO correct?
        search.pagingValue
      )
    }

    if (search.limit) {
      query = query.limit(search.limit);
    } else {
      logger.warn('Performing search without limit!', [], {search});
    }

    query = query.orderBy(
      search.sortColumn ?? SearchQuerySortColumn.Name,
      search.sortDirection === SearchQuerySortDirection.Descending ? 'desc' : 'asc'
    );

    logger.log("Performing sqlite search " + query.toQuery());

    const itemIds: Array<{ id: string }> = await query;

    logger.log("Search yielded IDs: ", [], {itemIds, search, query: query.toQuery()});

    // TODO extract getDataItem code into seperate call and use it to complete data items instead of refetching
    const items = (await Promise.all(itemIds.map(({id}) => this.getDataItem(id))))
      .filter(item => !!item) as DataItem[];
    // TODO search content table

    logger.log("Search yielded items: ", [], {items});

    return {
      results: items,
      nextPagingValue: items[items.length - 1]?.[search.sortColumn ?? SearchQuerySortColumn.Name],
      nextPageAvailable: !!search.limit && items.length === search.limit
    };
  }

  public async loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    const mediaItem = await this.getDataItem(id) as MediaItem;
    return await fs.readFile(this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension));
  }

  public async loadMediaItemContentAsPath(id: string): Promise<string> {
    const mediaItem = await this.getDataItem(id) as MediaItem;
    return mediaItem.referencePath || this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension);
  }

  public async loadMediaItemContentThumbnailAsPath(id: string): Promise<string | undefined> {
    const mediaItem = await this.getDataItem(id) as MediaItem;
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
    const mediaItem = await this.getDataItem(id) as MediaItem;
    logger.log("Storing media item content", [], {id, localPath, mediaItem, thumbnail});
    if (!mediaItem.referencePath) {
      await fs.copyFile(localPath, this.resolvePath(MEDIA_DIR, id + '.' + mediaItem.extension));
    }

    if (thumbnail && (thumbnail.width || thumbnail?.height) && this.thumbnailExtensions.includes(mediaItem.extension)) {
      logger.log("Preparing thumbnail", [], {thumbnail, mediaItem, localPath});
      const file = await fs.readFile(localPath);
      const jimpImage = await Jimp.read(file);
      logger.log("Read original image", [], {jimpImage});
      const resized = await jimpImage.resize(thumbnail.width || Jimp.AUTO, thumbnail.height || Jimp.AUTO);
      const buffer = await resized.getBufferAsync(resized.getMIME());
      await fs.writeFile(this.resolvePath(MEDIA_DIR, id + '.thumb.' + mediaItem.extension), buffer);
      // .writeAsync(this.resolvePath(MEDIA_DIR, id + '.thumb.' + mediaItem.extension));
      logger.log("Resized image and stored thumbnail", [], {});
    }
  }

  public async removeMediaItemContent(item: MediaItem): Promise<DataSourceActionResult> {
    const mediaPath = this.resolvePath(MEDIA_DIR, item.id + '.' + item.extension);
    const thumbPath = this.resolvePath(MEDIA_DIR, item.id + '.thumb.' + item.extension);
    logger.log("Removing media contents", [], {item, mediaPath, thumbPath, hasThumb: item.hasThumbnail});
    await fs.unlink(mediaPath);

    if (item.hasThumbnail) {
      await fs.unlink(thumbPath);
    }
  }

  public async persist(): Promise<DataSourceActionResult> {
    await fs.writeFile(this.resolvePath(NOTEBOOK_FILE), JSON.stringify({ structures: this.structures }, null, 2));
  }

  public async getStructure(id: string): Promise<any> {
    return this.structures[id];
  }

  public async storeStructure(id: string, structure: any): Promise<DataSourceActionResult> {
    this.structures[id] = structure;
  }
}
