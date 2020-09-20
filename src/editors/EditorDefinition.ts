import React from 'react';
import { NoteDataItem } from '../types';

export interface EditorComponentProps<C extends object> {
  content: C;
  item: NoteDataItem<any>;
  onChange: () => void;
  onRegister: (grabContent: () => Promise<C>) => void;
}

export interface EditorDefinition<T extends string, C extends object> {
  id: T;
  name: string;
  initializeContent: () => C;
  editorComponent: React.FC<EditorComponentProps<C>>;
}