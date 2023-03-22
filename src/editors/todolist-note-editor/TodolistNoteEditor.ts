import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';

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
  public id = 'todolist-editor-note' as const;
  public name = 'Todo List';
  public editorComponent = EditorComponent;
  public canInsertFiles = false;

  public initializeContent(): TodoListNoteEditorContent {
    return {
      items: [],
    };
  }

  public async exportContent(content: TodoListNoteEditorContent): Promise<string> {
    return content.items.map(item => {
      const tick = item.tickedOn ? '[x]' : '[ ]';
      const descr = item.description ? `\n   - ${item.description}` : '';
      const steps = item.steps.map(step => `\n      - ${step.title}`).join('');
      return `${tick} ${item.title}${descr}${steps}`;
    }).join('\n');
  }

  public getExportFileExtension(content: TodoListNoteEditorContent): string {
    return 'md';
  }
}
