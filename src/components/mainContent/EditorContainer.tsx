import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NoteDataItem } from '../../types';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useAsyncEffect } from '../../utils';
import { LogService } from '../../common/LogService';

const logger = LogService.getLogger('EditorContainer');

export const EditorContainer: React.FC<{
  noteItem: NoteDataItem<any>;
  currentContent: any;
  onChangeContent: (noteId: string, newContent: any) => void;
}> = props => {
  const dataInterface = useDataInterface();
  const editor = EditorRegistry.Instance.getEditorWithId(props.noteItem.noteType);
  const [currentNote, setCurrentNote] = useState(props.noteItem);
  const [currentContent, setCurrentContent] = useState(props.currentContent);
  // const [saveHandler, setSaveHandler] = useState<number | null>(null);
  const saveHandler = useRef<number | undefined>(undefined);
  const grabContentHandler = useRef<(() => Promise<object>) | undefined>();

  useEffect(() => logger.log("changed noteitem", [props.noteItem.name]), [props.noteItem.id])
  useEffect(() => logger.log("changed currentContent", [], {content: props.currentContent, item: props.noteItem.name}), [props.currentContent])

  // useEffect(() => {
  //   setCurrentContent(props.currentContent);
  //   setCurrentNote(props.noteItem);
  // }, [props.noteItem]);

  useEffect(() => {

  }, []);

  const clearSaveHandler = () => {
    clearTimeout(saveHandler.current);
    saveHandler.current = undefined;
  }

  const save = async () => {
    if (!grabContentHandler.current) {
      throw Error('Trying to save before editor has registered.');
    }
    if (saveHandler.current) {
      clearSaveHandler();
    }
    const content = await grabContentHandler.current();
    logger.log("Saving editor contents for ", [currentNote.id, currentNote.name], {currentNote, content});
    props.onChangeContent(currentNote.id, content);
    await dataInterface.writeNoteItemContent(currentNote.id, content);
  };

  useEffect(() => {
    (async () => {
      logger.log("Note ID changed", [], props);

      if (grabContentHandler.current && saveHandler.current) {
        logger.log("Old note is still unsaved, saving...");
        await save();
      }

      setCurrentContent(props.currentContent);
      setCurrentNote(props.noteItem);
      // grabContentHandler.current = undefined; // TODO
    })();
  }, [props.noteItem.id]);

  // useEffect(() => {
  //   return () => { save(); } // TODO this does more damage than it helps!!!!!!!
  // }, [])

  // useEffect(() => {
  //   return () => {
  //     (async () => {
  //       logger.log("Unregister")
  //       if (saveHandler.current && grabContentHandler.current) {
  //         logger.log("Save before changing editor")
  //         clearTimeout(saveHandler.current);
  //         dataInterface.writeNoteItemContent(props.noteItem.id, await grabContentHandler.current());
  //         saveHandler.current = undefined;
  //       }
  //     })();
  //   }
  //   // grabContentHandler.current = undefined;
  // }, [props.noteItem.id]);

  // useEffect(() => save, [props.noteItem.id]);

  if (!editor) {
    return <div>Error!</div>;
  }

  const EditorComponent = editor.editorComponent;
  // console.log("Using content", currentContent, props)

  return (
    <div>
      <EditorComponent
        key={currentNote.id} // cleanly remount component on changing item
        content={currentContent}
        item={currentNote}
        onRegister={grabContent => {
          logger.log("Registered")
          grabContentHandler.current = grabContent;
        }}
        onChange={() => {
          if (grabContentHandler.current) {
            logger.log("change detected, grabContentHandler registered");
            if (saveHandler.current) {
              clearSaveHandler();
            }
            saveHandler.current = setTimeout(() => save(), 3000) as unknown as number;
          } else {
            logger.log("change detected, but no grabContentHandler registered");
          }
        }}
      />
    </div>
  );
};
