import { DataItem, SearchQuery } from '../types';
import { AbstractDataSource } from './AbstractDataSource';
import { doArraysIntersect } from '../utils';

export class SearchHelper {
  public static async satisfiesSearch(item: DataItem<any>, search: SearchQuery, dataSource: AbstractDataSource) {
    if (search.kind && search.kind !== item.kind) {
      return false;
    }

    if (search.childs && !doArraysIntersect(search.childs, item.childIds)) {
      return false;
    }

    if (search.exactParents || search.parents) {
      const parents = (await dataSource.getParentsOf(item.id)).map(parent => parent.id);
      if (search.parents && !doArraysIntersect(search.parents, parents)) {
        return false
      }

      if (search.exactParents && (parents.length !== search.exactParents.length
        || !search.exactParents.map(p => parents.includes(p)).reduce((a, b) => a && b, true))) {
        return false;
      }
    }

    if (search.tags && !search.tags.map(t => item.tags.includes(t)).reduce((a, b) => a && b, true)) {
      return false;
    }

    if (search.contains && !search.contains.map(c => item.name.includes(c)).reduce((a, b) => a || b, false)) {
      return false;
    }

    return true;
  }
}