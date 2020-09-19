import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';

export interface AtlassianNoteEditorContent {
  adf: any;
}

export class AtlaskitNoteEditor implements EditorDefinition<'atlaskit-editor-note', AtlassianNoteEditorContent> {
  public id = "atlaskit-editor-note" as const;
  public name = "Note";
  public editorComponent = EditorComponent;

  public initializeContent(): AtlassianNoteEditorContent {
    return {
      adf: {
        "version": 1,
        "type": "doc",
        "content": []
      }
    };
  }
}
