import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';
import { SmallPreviewComponent } from './SmallPreviewComponent';

export interface AtlassianNoteEditorContent {
  adf: any;
}

export class AtlaskitNoteEditor implements EditorDefinition<'atlaskit-editor-note', AtlassianNoteEditorContent> {
  public id = 'atlaskit-editor-note' as const;
  public name = 'Note';
  public editorComponent = EditorComponent;
  public smallPreviewComponent = SmallPreviewComponent;
  public canInsertFiles = false;

  public initializeContent(): AtlassianNoteEditorContent {
    return {
      adf: {
        version: 1,
        type: 'doc',
        content: [],
      },
    };
  }
}
