import React from 'react';
import { NoteDataItem } from '../types';
import { MarkdownExportOptions } from '../appdata/runMarkdownExport';

export interface EditorComponentProps<C extends object> {
  content: C;
  item: NoteDataItem<any>;
  onChange: () => void;
  onRegister: (grabContent: () => Promise<C>) => void;
  onDismount: (content: C) => void;
}

export interface EditorSmallPreviewProps<C extends object> {
  content: C;
  item: NoteDataItem<any>;
}

export interface EditorDefinition<T extends string, C extends object> {
  id: T;
  name: string;
  canInsertFiles: boolean;
  initializeContent: () => C;
  editorComponent: React.FC<EditorComponentProps<C>>;
  smallPreviewComponent?: React.FC<EditorSmallPreviewProps<C>>;
  exportContent: (content: C, note: NoteDataItem<any>, options: MarkdownExportOptions) => Promise<string>;
  getExportFileExtension: (content: C) => string;
}
