import * as React from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import { AtlassianNoteEditorContent } from './AtlaskitNoteEditor';
import { Editor, EditorActions, EditorContext, WithEditorActions } from '@atlaskit/editor-core';
import cxs from 'cxs';
import { useEffect, useRef, useState } from 'react';
import { LogService } from '../../common/LogService';
import { IgnoreErrorBoundary } from '../../common/IgnoreErrorBoundary';

const logger = LogService.getLogger('AtlaskitEditorComponent');

const styles = {
  container: cxs({
    ' .akEditor': {
      border: 'none'
    }
  })
}

export const EditorComponent: React.FC<EditorComponentProps<AtlassianNoteEditorContent>> = props => {
  const editorRef = useRef<EditorActions | null>(null);
  // const isChangingNote = useRef(false);

  useEffect(() => logger.log("Remount", [props.item.id], {content: props.content}), [])

  // useEffect(() => {
  //   isChangingNote.current = true;
  //   if (editorRef.current) {
  //     logger.log("Reload content to", [], {content: JSON.stringify(props.content.adf)})
  //     editorRef.current?.replaceDocument(JSON.stringify(props.content.adf));
  //   } else {
  //     logger.error("Could not reload content, editorRef is null", [], {content: JSON.stringify(props.content.adf)})
  //   }
  //   setTimeout(() => isChangingNote.current = false, 1000);
  // }, [props.item.id])

  return (
    <div className={styles.container}>
      <IgnoreErrorBoundary>
        <EditorContext>
          <WithEditorActions
            render={actions => {
              logger.log("Render WithEditorActions")
              editorRef.current = actions;
              props.onRegister(async () => ({ adf: await actions.getValue() }));
              return (
                <Editor
                  allowTables={{
                    advanced: true,
                  }}
                  codeBlock={{
                  }}
                  allowExpand={true}
                  insertMenuItems={[]}
                  quickInsert={true}
                  allowTextColor={true}
                  allowTextAlignment={true}
                  defaultValue={JSON.stringify(props.content.adf)}
                  onChange={editorView => {
                    // if (!isChangingNote.current) props.onChange();
                    props.onChange();
                  }}
                />
              );
            }}
          />
        </EditorContext>
      </IgnoreErrorBoundary>
    </div>
  );
};
