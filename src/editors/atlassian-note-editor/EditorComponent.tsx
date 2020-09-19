import * as React from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import { AtlassianNoteEditorContent } from './AtlaskitNoteEditor';
import { Editor, EditorActions, EditorContext, WithEditorActions } from '@atlaskit/editor-core';
import cxs from 'cxs';
import { useEffect, useRef } from 'react';

const styles = {
  container: cxs({
    ' .akEditor': {
      border: 'none'
    }
  })
}

export const EditorComponent: React.FC<EditorComponentProps<AtlassianNoteEditorContent>> = props => {
  const editorRef = useRef<EditorActions | null>(null);
  useEffect(() => {
    editorRef.current?.replaceDocument(JSON.stringify(props.content.adf));
    console.log("Reload content to", JSON.stringify(props.content.adf))
    }, [props.item.id])

  console.log("loaded", props.item.name, JSON.stringify(props.content.adf))

  return (
    <div className={styles.container}>
      <EditorContext>
        <WithEditorActions
          render={actions => {
            editorRef.current = actions;
            return (
              <Editor
                allowTables={{
                  advanced: true,
                }}
                codeBlock={{}}
                insertMenuItems={[]}
                quickInsert={true}
                allowTextColor={true}
                allowTextAlignment={true}
                defaultValue={JSON.stringify(props.content.adf)}
                onChange={editorView => {
                  console.log("!!!!", actions.getValue(), editorView.state.toJSON())
                  actions.getValue().then(value => props.onChange({ adf: value }));
                  // props.onChange({ adf: actions.getValue() })
                }}
              />
            );
          }}
        />
      </EditorContext>
    </div>
  );
};
