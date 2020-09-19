import * as React from 'react';
import { NoteDataItem } from '../../types';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { useCallback, useEffect, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

export const EditorContainer: React.FC<{
  noteItem: NoteDataItem<any>;
  currentContent: any;
  onChangeContent: (newContent: any) => void;
}> = props => {
  const dataInterface = useDataInterface();
  const editor = EditorRegistry.Instance.getEditorWithId(props.noteItem.noteType);
  const [currentContent, setCurrentContent] = useState(props.currentContent);
  const [currentNote, setCurrentNote] = useState(props.noteItem);
  const [saveHandler, setSaveHandler] = useState<number | null>(null);

  useEffect(() => {
    setCurrentContent(props.currentContent);
    setCurrentNote(props.noteItem);
  }, [props.noteItem]);

  const save = useCallback(() => {
    console.log("Saving editor contents for ", props.noteItem.id, props.noteItem.name)
    dataInterface.writeNoteItemContent(props.noteItem.id, currentContent);
  }, [currentContent, props.noteItem]);

  // useEffect(() => save, [props.noteItem.id]);

  if (!editor) {
    return <div>Error!</div>;
  }

  const EditorComponent = editor.editorComponent;
  console.log("Using content", currentContent, props)

  return (
    <div>
      <EditorComponent
        content={currentContent}
        item={currentNote}
        onChange={newContent => {
          if (saveHandler) {
            clearTimeout(saveHandler);
          }
          const handler = setTimeout(save, 3000) as unknown as number;
          setSaveHandler(handler);
          setCurrentContent(newContent);
        }}
      />
    </div>
  );
};
