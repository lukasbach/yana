import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';
import { AtlassianNoteEditorContent } from '../atlassian-note-editor/AtlaskitNoteEditor';
import { MarkdownExportOptions } from '../../appdata/runMarkdownExport';
import { NoteDataItem } from '../../types';

export interface MonacoNoteEditorContent {
  content: string;
  language?: string;
}

export class MonacoNoteEditor implements EditorDefinition<'monaco-editor-note', MonacoNoteEditorContent> {
  public id = 'monaco-editor-note' as const;
  public name = 'Code Snippet';
  public editorComponent = EditorComponent;
  public canInsertFiles = false;

  public initializeContent(): MonacoNoteEditorContent {
    return {
      content: '',
    };
  }

  public async exportContent(content: MonacoNoteEditorContent, note: NoteDataItem<any>, options: MarkdownExportOptions): Promise<string> {
    if (options.makeTextFilesToMarkdown) {
      const fence = "```";
      const tags = note.tags.map(tag => `#${tag}`).join(' ');
      return `# ${note.name}\n${tags}\n\n${fence}${content.language || ''}\n${content.content}\n${fence}`;
    }
    return content.content;
  }

  public getExportFileExtension(content: MonacoNoteEditorContent): string {
    switch(content.language) {
      case 'typescript':
        return 'ts';
      case 'javascript':
        return 'js';
      case 'markdown':
        return 'md';
      case 'python':
        return 'py';
      case undefined:
        return 'txt';
      default:
        return content.language;
    }
  }
}
