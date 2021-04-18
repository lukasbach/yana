import { TodoListItem } from './TodolistNoteEditor';

export interface SortCriterium {
  id: string;
  name: string;
  compare: (item1: TodoListItem, item2: TodoListItem) => number;
}

export const TaskNameSortCriterium: SortCriterium = {
  id: 'taskname',
  name: 'Task Name',
  compare: (item1, item2) => {
    return item1.title.localeCompare(item2.title);
  },
};

export const TaskColorNameSortCriterium: SortCriterium = {
  id: 'color',
  name: 'Color',
  compare: (item1, item2) => {
    return (item1.color || '').localeCompare(item2.color || '');
  },
};

export const CompletedStatusSortCriterium: SortCriterium = {
  id: 'completedstatus',
  name: 'Completed Status',
  compare: (item1, item2) => {
    return (item2.tickedOn || 0) - (item1.tickedOn || 0);
  },
};

export const StarStatusSortCriterium: SortCriterium = {
  id: 'starStatus',
  name: 'Star Status',
  compare: (item1, item2) => {
    return (item1.starred ? 0 : 1) - (item2.starred ? 0 : 1);
  },
};
