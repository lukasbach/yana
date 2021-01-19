import { EditorDefinition, FileExportOption } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';
import { SmallPreviewComponent } from './SmallPreviewComponent';
import { MarkdownTransformer } from '@atlaskit/editor-markdown-transformer';
import * as fs from 'fs';

export interface AtlassianNoteEditorContent {
  adf: any;
}

export class AtlaskitNoteEditor implements EditorDefinition<'atlaskit-editor-note', AtlassianNoteEditorContent> {
  public id = "atlaskit-editor-note" as const;
  public name = "Note";
  public editorComponent = EditorComponent;
  public smallPreviewComponent = SmallPreviewComponent;
  public canInsertFiles = false;

  public initializeContent(): AtlassianNoteEditorContent {
    return {
      adf: {
        "version": 1,
        "type": "doc",
        "content": []
      }
    };
  }

  public exportOptions: FileExportOption<AtlassianNoteEditorContent>[] = [
    {
      name: "Markdown File",
      fileExtension: "md",
      export: async (content, targetPath) => {
        const md = new MarkdownTransformer().encode(content.adf);
        await fs.promises.writeFile(targetPath, md);
      }
    }
  ]
}
