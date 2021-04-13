import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';

export interface MarkdownNoteEditorContent {
  content: string;
}

export class MarkdownNoteEditor implements EditorDefinition<'markdown-editor-note', MarkdownNoteEditorContent> {
  public id = "markdown-editor-note" as const;
  public name = "Markdown Note";
  public editorComponent = EditorComponent;
  public canInsertFiles = false;

  public initializeContent(): MarkdownNoteEditorContent {
    return {
      content: ''
    };
  }
}
