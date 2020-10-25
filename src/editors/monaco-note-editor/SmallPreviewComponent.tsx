import * as React from 'react';
import { EditorSmallPreviewProps } from '../EditorDefinition';
import { ReactRenderer } from '@atlaskit/renderer';
import { MonacoNoteEditorContent } from './MonacoNoteEditor';

export const SmallPreviewComponent: React.FC<EditorSmallPreviewProps<MonacoNoteEditorContent>> = props => {
  return (
    <div />
  );
};
