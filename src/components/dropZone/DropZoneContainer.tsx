import * as React from 'react';
import { useEffect, useState } from 'react';
import { FileDropZone } from './FileDropZone';
import { Button, Callout, Classes, Dialog, Spinner, Switch } from '@blueprintjs/core';
import { FilePreview } from './FilePreview';
import { UploadEntity } from './UploadEntity';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { DataItemKind, MediaItem } from '../../types';
import path from 'path';
import { useMainContentContext } from '../mainContent/context';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { isNoteItem } from '../../utils';
import { FileAddEvent } from '../../datasource/DataInterface';

export const DropZoneContainer: React.FC<{}> = props => {
  const [droppedFiles, setDroppedFiles] = useState<UploadEntity[]>([]);
  const [createThumbnails, setCreateThumbnails] = useState(true);
  const [copyFiles, setCopyFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [addToCurrentEditor, setAddToCurrentEditor] = useState(true);
  const [canAddToCurrentEditor, setCanAddToCurrentEditor] = useState(false);
  const dataInferface = useDataInterface();
  const mainContent = useMainContentContext();
  // useEffect(() => setDroppedFiles([{"name":"cook-smarts-guide-to-flavoring-with-spices_543325358c24f_w1500.png","path":"C:\\Users\\Lukas Bach\\Desktop\\cook-smarts-guide-to-flavoring-with-spices_543325358c24f_w1500.png","lastModified":1590451333641,"size":425766,"type":"image/png"},{"name":"f1040x.pdf","path":"C:\\Users\\Lukas Bach\\Desktop\\f1040x.pdf","lastModified":1591965833329,"size":194012,"type":"application/pdf"},{"name":"HerbGuide_HorizontalScreen_Draft1.png","path":"C:\\Users\\Lukas Bach\\Desktop\\HerbGuide_HorizontalScreen_Draft1.png","lastModified":1590451347712,"size":193208,"type":"image/png"},{"name":"arkcalc.txt","path":"C:\\Users\\Lukas Bach\\Desktop\\arkcalc.txt","lastModified":1595019443022,"size":296,"type":"text/plain"},{"name":"arkcalc-new.txt","path":"C:\\Users\\Lukas Bach\\Desktop\\arkcalc-new.txt","lastModified":1593652111219,"size":457,"type":"text/plain"},{"name":"colored.png","path":"C:\\Users\\Lukas Bach\\Desktop\\colored.png","lastModified":1569449599523,"size":26124,"type":"image/png"} as any].map(i => ({file: i, name: i.name}))), []);

  useEffect(() => {
    console.log(mainContent.openTab?.dataItem, EditorRegistry.Instance.getEditorWithId(mainContent.openTab?.dataItem?.kind))
    if (mainContent.openTab?.dataItem?.id && isNoteItem(mainContent.openTab.dataItem)) {
      const editor = EditorRegistry.Instance.getEditorWithId(mainContent.openTab.dataItem.noteType);
      if (editor && editor.canInsertFiles) {
        setCanAddToCurrentEditor(true);
        return;
      }
    }
    setCanAddToCurrentEditor(false);
  }, [mainContent.openTab]);

  console.log(droppedFiles)

  const confirm = async () => {
    setIsUploading(true);
    const events: FileAddEvent[] = [];

    for (const file of droppedFiles) {
      const dataItem = await dataInferface.createDataItem<DataItemKind.MediaItem>({
        name: file.name,
        kind: DataItemKind.MediaItem,
        tags: [],
        childIds: [],
        created: new Date().getTime(),
        lastChange: new Date().getTime(),
        referencePath: copyFiles ? undefined : file.file.path,
        size: file.file.size,
        type: 'image', // TODO
        extension: path.extname(file.file.path).slice(1),
        hasThumbnail: createThumbnails
      } as Omit<MediaItem, 'id'>) as MediaItem;
      await dataInferface.storeMediaItemContent(
        dataItem.id,
        file.file.path,
        createThumbnails ? { width: 280 } : undefined
      );
      events.push({ id: dataItem.id, insertIntoActiveEditor: addToCurrentEditor, item: dataItem });
    }
    dataInferface.onAddFiles.emit(events);
    setIsUploading(false);
    setDroppedFiles([]);
    setCopyFiles(true);
    setAddToCurrentEditor(true);
    setCreateThumbnails(true);
  };

  return (
    <>
      <FileDropZone onDropFiles={files => setDroppedFiles(files.map(file => ({ file, name: file.name })))} />
      <Dialog
        isOpen={!!droppedFiles.length}
        onClose={() => setDroppedFiles([])}
        title="Adding files to Yana"
        icon="upload"
      >
        <div className={Classes.DIALOG_BODY}>
          <Callout intent={'danger'} icon={'warning-sign'}>
            Adding files is currently in beta. Use at your own risk!
          </Callout>
          {
            droppedFiles.map(file => (
              <FilePreview
                key={file.file.path}
                file={file}
                onRemove={() => {}}
                onChange={changed => setDroppedFiles(files => files.map(f => f.file.path === changed.file.path ? changed : f))}
              />
            ))
          }

          { canAddToCurrentEditor && (
            <Switch
              label="Add files to current note"
              checked={addToCurrentEditor}
              onChange={(e: any) => setAddToCurrentEditor(e.target.checked)}
            />
          )}
          <Switch
            label="Copy files into Yana workspace"
            checked={copyFiles}
            onChange={(e: any) => setCopyFiles(e.target.checked)}
          />
          <Switch
            label="Create thumbnails for applicable files"
            checked={createThumbnails}
            onChange={(e: any) => setCreateThumbnails(e.target.checked)}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button icon="cross" minimal onClick={() => setDroppedFiles([])}>
              Discard
            </Button>
            <Button icon="upload"loading={isUploading} intent="primary" outlined disabled={isUploading} onClick={confirm}>
              Upload
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
