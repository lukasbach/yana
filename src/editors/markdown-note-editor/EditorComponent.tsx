import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import cxs from 'cxs';
import { LogService } from '../../common/LogService';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { HTMLSelect, ResizeSensor } from '@blueprintjs/core';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import * as monacoEditor from 'monaco-editor';
import { useSettings } from '../../appdata/AppDataProvider';
import { useScreenView } from '../../components/telemetry/useScreenView';
import { MarkdownNoteEditorContent } from './MarkdownNoteEditor';

// @ts-ignore
import { BangleEditor, useEditorState } from '@bangle.dev/react';
// @ts-ignore
import { Plugin, PluginKey, SpecRegistry } from '@bangle.dev/core';
// @ts-ignore
import { corePlugins, coreSpec } from '@bangle.dev/core/utils/core-components';
// @ts-ignore
import { floatingMenu, FloatingMenu } from '@bangle.dev/react-menu';
// @ts-ignore
import * as markdown from '@bangle.dev/markdown';

import '@bangle.dev/core/style.css';
import '@bangle.dev/tooltip/style.css';
import '@bangle.dev/react-menu/style.css';

const logger = LogService.getLogger('MonacoEditorComponent');

const styles = {
  container: cxs({
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }),
  header: cxs({
    height: '36px',
    margin: '0 16px',
    textAlign: 'right'
  }),
  editorContainer: cxs({
    position: 'relative',
    flexGrow: 1,
    overflow: 'hidden',
    '> .react-monaco-editor-container': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }
  })
};

const menuKey = new PluginKey('menuKey');

// const specRegistry = new SpecRegistry(coreSpec());
// const parser = markdown.markdownParser(specRegistry);
// const serializer = markdown.markdownSerializer(specRegistry);

export const EditorComponent: React.FC<EditorComponentProps<MarkdownNoteEditorContent>> = props => {
  const settings = useSettings();
  const [content, setContent] = useState(props.content.content);
  const monacoEditorRef = useRef<IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monacoEditor>();
  const currentNoteValue = useRef<MarkdownNoteEditorContent>({ content });

  useScreenView('markdown-note-editor');

  useEffect(() => {
    currentNoteValue.current = { content };
  }, [content]);

  useEffect(() => {
    props.onRegister(async () => currentNoteValue.current);
  }, []);

  useEffect(() => () => {
    props.onDismount(currentNoteValue.current);
  }, []);

  const editorState = useEditorState({
    // specs: specRegistry,
    plugins: () => [
      ...corePlugins(),
      floatingMenu.plugins({
        key: menuKey,
      }),
      new Plugin({
        view: () => ({
          update: (view: any, prevState: any) => {
            if (!view.state.doc.eq(prevState.doc)) {
              console.log(view)
            }
          },
        }),
      }),
    ],
    // initialValue: parser.parse(props.content.content),
  });


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        Header
      </div>
      <div className={styles.editorContainer}>
        <BangleEditor state={editorState}>
          <FloatingMenu menuKey={menuKey} />
        </BangleEditor>
      </div>
    </div>
  );
};
