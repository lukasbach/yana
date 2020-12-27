import * as React from 'react';
import { DataItem, NoteDataItem } from '../../../types';
import { EditorRegistry } from '../../../editors/EditorRegistry';
import { useDataItemContent } from '../../../datasource/useDataItemContent';
import cxs from 'cxs';
import { NonIdealState, Spinner } from '@blueprintjs/core';

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

export const DataItemSmallPreviewContainer: React.FC<{ noteItem: NoteDataItem<any>, noteItemContent?: object }> = props => {
  const editor = EditorRegistry.Instance.getEditorWithId(props.noteItem.noteType);

  if (!editor || !editor.smallPreviewComponent) {
    return <NonIdealState icon={'document'} />;
  }

  const PreviewComponent = editor.smallPreviewComponent;

  return (
    <div className={containerStyle}>
      { props.noteItemContent ? (
        <PreviewComponent item={props.noteItem} content={props.noteItemContent} />
      ) : (
        <NonIdealState icon={<Spinner />} />
      ) }
    </div>
  );
};
