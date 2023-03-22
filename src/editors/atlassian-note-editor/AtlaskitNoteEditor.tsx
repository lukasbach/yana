import { EditorDefinition } from '../EditorDefinition';
import { EditorComponent } from './EditorComponent';
import { SmallPreviewComponent } from './SmallPreviewComponent';
import { ReactRenderer, renderDocument, ReactSerializer, TextSerializer } from '@atlaskit/renderer';
import ReactDOM from 'react-dom';
import Turndown from 'turndown';
import * as React from 'react';
import { NoteDataItem } from '../../types';

export interface AtlassianNoteEditorContent {
  adf: any;
}

export class AtlaskitNoteEditor implements EditorDefinition<'atlaskit-editor-note', AtlassianNoteEditorContent> {
  public id = 'atlaskit-editor-note' as const;
  public name = 'Note';
  public editorComponent = EditorComponent;
  public smallPreviewComponent = SmallPreviewComponent;
  public canInsertFiles = false;

  public initializeContent(): AtlassianNoteEditorContent {
    return {
      adf: {
        version: 1,
        type: 'doc',
        content: [],
      },
    };
  }

  public async exportContent(content: AtlassianNoteEditorContent, note: NoteDataItem<any>): Promise<string> {
    const dumpElement = document.createElement('div');
    dumpElement.style.display = 'none';
    document.body.appendChild(dumpElement);
    return new Promise<string>(r => {
      ReactDOM.render(<ReactRenderer document={content.adf} />, dumpElement, () => {
        setTimeout(() => {
          // patch p elements from inside li elements
          Array.from(dumpElement.getElementsByTagName("li")).forEach(li => {
            if (li.children.length === 1 && li.children.item(0).tagName.toLowerCase() === "p") {
              li.innerHTML = li.children[0].innerHTML;
            }
          });
          // patch line numbers away from code blocks
          Array.from(dumpElement.getElementsByClassName("linenumber")).forEach(item => {
            item.outerHTML = "";
          });
          Array.from(dumpElement.querySelectorAll<HTMLElement>(".code-block code > span")).forEach(item => {
            item.outerHTML = item.innerHTML;
          });
          Array.from(dumpElement.querySelectorAll<HTMLElement>(".code-block")).forEach(item => {

            const code = item.querySelector<HTMLElement>("code").innerHTML;
            item.innerHTML = `<pre><code>${code}</code></pre>`;
          });


          const text = dumpElement.innerHTML;
          document.body.removeChild(dumpElement);
          const td = new Turndown({
            headingStyle: "atx",
            hr: "---",
            codeBlockStyle: "fenced",
          });
          const markdown = td.turndown(text);
          const tags = note.tags.map(tag => `#${tag}`).join(' ');
          r(tags ? `${markdown}\n\n${tags}` : markdown);
        });
      });
    })
  }

  public getExportFileExtension(content: AtlassianNoteEditorContent): string {
    return 'md';
  }
}
