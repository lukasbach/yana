import * as React from 'react';
import { DataItem, NoteDataItem } from '../../../types';
import { EditorRegistry } from '../../../editors/EditorRegistry';
import { useDataItemContent } from '../../../datasource/useDataItemContent';
import cxs from 'cxs';

const containerStyle = cxs({
  height: '100%',
  maxHeight: '100%',
  overflow: 'hidden',
  ' *': {
    fontSize: '11px !important',
    color: 'black !important'
  },
  ' p': {
    margin: '0 !important',
  }
})

export const DataItemSmallPreviewContainer: React.FC<{ noteItem: NoteDataItem<any> }> = props => {
  const editor = EditorRegistry.Instance.getEditorWithId(props.noteItem.noteType);
  const noteContent = useDataItemContent(editor && editor.smallPreviewComponent ? props.noteItem.id : undefined);

  console.log("??" , editor, noteContent, props.noteItem)

  if (!editor || !editor.smallPreviewComponent || !noteContent) {
    return null;
  }

  const PreviewComponent = editor.smallPreviewComponent;

  return (
    <div className={containerStyle}>
      <PreviewComponent item={props.noteItem} content={noteContent} />
    </div>
  );
};
