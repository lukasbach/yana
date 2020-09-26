import * as React from 'react';
import { EditorSmallPreviewProps } from '../EditorDefinition';
import { AtlassianNoteEditorContent } from './AtlaskitNoteEditor';
import { ReactRenderer } from '@atlaskit/renderer';

export const SmallPreviewComponent: React.FC<EditorSmallPreviewProps<AtlassianNoteEditorContent>> = props => {
  return (
    <ReactRenderer document={props.content.adf} />
  );
};
