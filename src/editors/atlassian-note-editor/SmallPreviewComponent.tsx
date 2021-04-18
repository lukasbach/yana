import * as React from 'react';
import { EditorSmallPreviewProps } from '../EditorDefinition';
import { AtlassianNoteEditorContent } from './AtlaskitNoteEditor';
import { ReactRenderer } from '@atlaskit/renderer';
import { NonIdealState } from '@blueprintjs/core';
import cxs from 'cxs';

export const SmallPreviewComponent: React.FC<EditorSmallPreviewProps<AtlassianNoteEditorContent>> = props => {
  if (props.content.adf.content.length === 0) {
    return (
      <div className={cxs({ ' *': { color: 'rgba(92, 112, 128, 0.6) !important' } })}>
        <NonIdealState icon={'document'} />
      </div>
    );
  }

  return <ReactRenderer document={props.content.adf} />;
};
