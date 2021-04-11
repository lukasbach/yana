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
import { InsertedImageProperties } from '@atlaskit/editor-common/dist/types/provider-factory/image-upload-provider';
import { isMediaItem } from '../../utils';
import { useSettings } from '../../appdata/AppDataProvider';
import { AutoSizer } from 'react-virtualized';
import { useScreenView } from '../../components/telemetry/useScreenView';

const logger = LogService.getLogger('AtlaskitEditorComponent');

const styles = {
  container: cxs({
    height: '100%',
    ' .akEditor': {
      border: 'none',
      ' hr': {
        borderBottom: '1px solid #000 !important'
      },
      ' [data-editor-popup="true"]': {
        left: '20px',
        width: 'max-content !important'
      }
    }
  })
}

export const EditorComponent: React.FC<EditorComponentProps<AtlassianNoteEditorContent>> = props => {
  const settings = useSettings();
  const editorRef = useRef<EditorActions | null>(null);
  const [insertImageFn, setInsertImageFn] = useState< { fn: (props: InsertedImageProperties) => void } | undefined>();
  const dataInterface = useDataInterface();

  useScreenView('atlassian-note-editor');

  useEffect(() => logger.log("Remount", [props.item.id], {content: props.content}), [])
  useEffect(() => () => {
    if (editorRef.current) {
      editorRef.current.getValue().then(adf => {
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
      <AutoSizer>
        {({width, height}) => {
          return (
            <div className={cxs({
              ' .akEditor': {
                height: height + 'px',
                width: width + 'px'
              },
              ' .akEditor > :nth-child(2)': {
                height: height - 40 + 'px',
                width: width + 'px',
                overflow: 'auto'
              }
            })}>
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
                            advanced: settings.editorAtlassianAdvancedTables,
                          }}
                          codeBlock={{
                          }}
                          media={{
                            allowMediaSingle: true,
                          }}
                          allowRule={true}
                          legacyImageUploadProvider={new Promise(res => res((e: Event | undefined, insertImageFn: (props: InsertedImageProperties) => void) => {
                            setInsertImageFn({ fn: insertImageFn });
                          }))}
                          allowTasksAndDecisions={true}
                          allowExpand={true}
                          allowFindReplace={{
                            allowMatchCase: true
                          }}
                          insertMenuItems={[]}
                          quickInsert={true}
                          allowTextColor={true}
                          allowTextAlignment={true}
                          defaultValue={JSON.stringify(props.content.adf)}
                          allowLayouts={{
                            allowBreakout: true,
                            UNSAFE_addSidebarLayouts: true
                          }}
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
          )
        }}
      </AutoSizer>
      <FindItemsDrawer
        title={"Insert file"}
        icon={'insert'}
        hiddenSearch={{ kind: DataItemKind.MediaItem }}
        isOpen={!!insertImageFn}
        onSetIsOpen={open => !open && setInsertImageFn(undefined)}
        onClickItem={(item) => {
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
    </div>
  );
};
