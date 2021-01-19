import React from 'react';
import { NoteDataItem } from '../types';

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

export interface FileExportOption<C extends object> {
  name: string;
  fileExtension: string;
  export: (content: C, targetPath: string) => Promise<void>;
}

export interface EditorDefinition<T extends string, C extends object> {
  id: T;
  name: string;
  canInsertFiles: boolean;
  initializeContent: () => C;
  editorComponent: React.FC<EditorComponentProps<C>>;
  smallPreviewComponent?: React.FC<EditorSmallPreviewProps<C>>;
  exportOptions?: FileExportOption<C>[];
}