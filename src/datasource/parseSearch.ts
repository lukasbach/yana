import { DataItemKind, SearchQuery } from '../types';

export const parseSearch = (value: string): SearchQuery => {
  const query: SearchQuery = {};

  const addToList = (entry: string, key: keyof SearchQuery) => {
    if (!(key in query)) {
      (query[key] as string[]) = [];
    }

    (query[key] as string[]).push(entry);
  };

  const pieces = [...value.matchAll(/(?:("[^"]*"))|([^\s]*)/g)]
    .filter(v => !!v[0].length)
    .map(v => v[0])
    .map(v => v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1) : v);

  for (const piece of pieces) {
    if (piece.includes(':')) {
      const [operator, value] = piece.split(":");
      switch (operator) {
        case 'tag':
          addToList(value, 'tags');
          break;
        case 'parent':
          addToList(value, 'parents');
          break;
        case 'kind':
          query.kind = value.toLowerCase() as DataItemKind;
          break;
        case 'intext':
          query.containsInContents = value === 'true';
      }
    } else {
      addToList(piece.toLowerCase(), 'contains');
    }
  }

  console.log(query, pieces, value)

  return query;
}