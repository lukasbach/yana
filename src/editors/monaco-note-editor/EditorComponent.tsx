import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import cxs from 'cxs';
import { LogService } from '../../common/LogService';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { MonacoNoteEditorContent } from './MonacoNoteEditor';
import { HTMLSelect, ResizeSensor } from '@blueprintjs/core';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import * as monacoEditor from 'monaco-editor';
import { useSettings } from '../../appdata/AppDataProvider';
import { useScreenView } from '../../components/telemetry/useScreenView';

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

const languages = ["Text","abap","aes","apex","azcli","bat","c","cameligo","clojure","coffeescript","cpp","csharp","csp","css","dart","dockerfile","fsharp","go","graphql","handlebars","hcl","html","ini","java","javascript","json","julia","kotlin","less","lexon","lua","markdown","mips","msdax","mysql","objective-c","pascal","pascaligo","perl","pgsql","php","plaintext","postiats","powerquery","powershell","pug","python","r","razor","redis","redshift","restructuredtext","ruby","rust","sb","scala","scheme","scss","shell","sol","sql","st","swift","systemverilog","tcl","twig","typescript","vb","verilog","xml","yaml"];

export const EditorComponent: React.FC<EditorComponentProps<MonacoNoteEditorContent>> = props => {
  const settings = useSettings();
  const [content, setContent] = useState(props.content.content);
  const [language, setLanguage] = useState(props.content.language);
  const editorRef = useRef<IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monacoEditor>();
  const currentNoteValue = useRef<MonacoNoteEditorContent>({ content, language });

  useScreenView('monaco-note-editor');

  useEffect(() => {
    currentNoteValue.current = { content, language };
  }, [content, language]);

  useEffect(() => {
    props.onRegister(async () => currentNoteValue.current);
  }, []);

  useEffect(() => () => {
    props.onDismount(currentNoteValue.current);
  }, []);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: 2,
        jsxFactory: 'React.createElement',
        reactNamespace: 'React',
        allowNonTsExtensions: true,
        allowJs: true,
      });
      monacoRef.current.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true
      });
    }
  }, [monacoRef.current])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <HTMLSelect
          minimal
          options={languages}
          value={language}
          onChange={(e: any) => {
            setLanguage(e.target.value === "Text" ? undefined : e.target.value);
            props.onChange();
          }}
        />
      </div>
      <div className={styles.editorContainer}>
        <ResizeSensor onResize={entries => editorRef.current?.layout()}>
          <MonacoEditor
            language={language || 'text'}
            theme={settings.editorMonacoTheme}
            value={content}
            options={{
              minimap: {enabled: settings.editorMonacoMinimap},
              renderControlCharacters: settings.editorMonacoRenderControlChars,
              renderWhitespace: settings.editorMonacoRenderWhitespace as any,
              rulers: (!!settings.editorMonacoRuler && settings.editorMonacoRuler !== 0 && [settings.editorMonacoRuler]) || undefined,
              tabSize: settings.editorMonacoTabSize,
              wordWrap: settings.editorMonacoWordWrap as any,
            }}
            editorDidMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
            }}
            onChange={val => {
              setContent(val);
              props.onChange();
            }}
          />
        </ResizeSensor>
      </div>
    </div>
  );
};
