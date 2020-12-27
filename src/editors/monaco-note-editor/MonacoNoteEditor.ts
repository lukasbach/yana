import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';

export interface MonacoNoteEditorContent {
  content: string;
  language?: string;
}

export class MonacoNoteEditor implements EditorDefinition<'monaco-editor-note', MonacoNoteEditorContent> {
  public id = "monaco-editor-note" as const;
  public name = "Code Snippet";
  public editorComponent = EditorComponent;
  public canInsertFiles = false;

  public initializeContent(): MonacoNoteEditorContent {
    return {
      content: ''
    };
  }
}
