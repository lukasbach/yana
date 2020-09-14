import { DataItem, SearchQuery } from '../types';

export class SearchHelper {
  public static satisfiesSearch(item: DataItem<any>, search: SearchQuery) {
    if (search.kind && search.kind !== item.kind) {
      return false;
    }

    if (search.exactParents && (
      search.exactParents.length !== item.parentIds.length ||
      !search.exactParents.map(p => item.parentIds.includes(p)).reduce((a, b) => a && b, true))
    ) {
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

    return true;
  }
}