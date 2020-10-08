import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import { AtlassianNoteEditorContent } from './AtlaskitNoteEditor';
import { Editor, EditorActions, EditorContext, WithEditorActions } from '@atlaskit/editor-core';
import cxs from 'cxs';
import { LogService } from '../../common/LogService';
import { IgnoreErrorBoundary } from '../../common/IgnoreErrorBoundary';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { FindItemsDrawer } from '../../components/drawers/findItemsDrawer/FindItemsDrawer';
import { DataItemKind, MediaItem } from '../../types';
import { InsertedImageProperties } from '@atlaskit/editor-common/dist/cjs/provider-factory/image-upload-provider';
import { isMediaItem } from '../../utils';

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
  const [insertImageFn, setInsertImageFn] = useState< { fn: (props: InsertedImageProperties) => void } | undefined>();
  const dataInterface = useDataInterface();

  useEffect(() => logger.log("Remount", [props.item.id], {content: props.content}), [])
  useEffect(() => () => {
    if (editorRef.current) {
      editorRef.current.getValue().then(adf => {
        console.log("1234asdf", adf);
        props.onDismount({adf});
      });
    }
  }, [])

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
      <FindItemsDrawer
        title={"Insert file"}
        icon={'insert'}
        hiddenSearch={{ kind: DataItemKind.MediaItem }}
        isOpen={!!insertImageFn}
        onSetIsOpen={open => !open && setInsertImageFn(undefined)}
        onClickItem={(item) => {
          console.log("????");
          (async () => {
            if (insertImageFn) {
              if (isMediaItem(item)) {
                const src = await dataInterface.loadMediaItemContentAsPath(item.id);
                insertImageFn.fn({ src, alt: item.name, title: item.name });
                setInsertImageFn(undefined);
              } else {
                throw Error('Cannot insert data item which is not a media item.');
              }
            }
          })();
        }}
      />
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
                  media={{
                    allowMediaSingle: true,
                  }}
                  legacyImageUploadProvider={new Promise(res => res((e: Event | undefined, insertImageFn: (props: InsertedImageProperties) => void) => {
                    console.log("!!!", insertImageFn);
                    setInsertImageFn({ fn: insertImageFn });
                  }))}
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
