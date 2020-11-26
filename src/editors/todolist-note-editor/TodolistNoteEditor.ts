import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';
import { SmallPreviewComponent } from './SmallPreviewComponent';

export interface TodoListItem {
  id: string;
  title: string;
  description: string;
  tickedOn?: number;
  starred: boolean;
  color?: string;
  steps: Array<{
    id: string;
    title: string;
    tickedOn: number;
  }>;
}

export interface TodoListNoteEditorContent {
  items: TodoListItem[];
}

export class TodolistNoteEditor implements EditorDefinition<'todolist-editor-note', TodoListNoteEditorContent> {
  public id = "todolist-editor-note" as const;
  public name = "Todo List";
  public editorComponent = EditorComponent;
  public smallPreviewComponent = SmallPreviewComponent;
  public canInsertFiles = false;

  public initializeContent(): TodoListNoteEditorContent {
    return {
      items: []
    };
  }
}
