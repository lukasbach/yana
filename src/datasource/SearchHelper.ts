import { DataItem, SearchQuery } from '../types';
import { AbstractDataSource } from './AbstractDataSource';
import { doArraysIntersect } from '../utils';

export class SearchHelper {
  public static async satisfiesSearch(item: DataItem<any>, search: SearchQuery, dataSource: AbstractDataSource) {
    console.log("Performing satisfiesSearch:", search, item)
    if (search.kind && search.kind !== item.kind) {
      console.log("Failed due to kind check")
      return false;
    }

    if (search.exactParents || search.parents) {
      const parents = (await dataSource.getParentsOf(item.id)).map(parent => parent.id);
      console.log("parents are", parents)
      if (search.parents && !doArraysIntersect(search.parents, parents)) {
        console.log("Failed due to parent check")
        return false
      }

      if (search.exactParents && (parents.length !== search.exactParents.length
        || !search.exactParents.map(p => parents.includes(p)).reduce((a, b) => a && b, true))) {
        console.log("Failed due to exactParent check")
        return false;
      }
    }

    if (search.tags && !search.tags.map(t => item.tags.includes(t)).reduce((a, b) => a && b, true)) {
      console.log("Failed due to tags check")
      return false;
    }

    if (search.contains && !search.contains.map(c => item.name.includes(c)).reduce((a, b) => a || b, false)) {
      console.log("Failed due to contains check")
      return false;
    }

    console.log("Succeeded")
    return true;
  }
}