import * as React from 'react';
import { Editor } from '@atlaskit/editor-core';
import { useState } from 'react';

const auth = async (ctx: any) => ({
  clientId: '',
  token: '',
  baseUrl: '',
});

export const RichEditor: React.FC<{}> = props => {
  const [file, setFile] = useState<File | undefined>();

  return (
    <div>
      <input type="file" id="test" onChange={e => setFile(e.target.files![0])} />

      <Editor
        allowTables={{
          advanced: true,
        }}
        codeBlock={{}}
        insertMenuItems={[]}
        quickInsert={true}
        allowTextColor={true}
        allowTextAlignment={true}
        legacyImageUploadProvider={
          new Promise(r =>
            r((e, ifn) => {
              console.log(e, ifn);
              ifn({
                src: URL.createObjectURL(file),
                alt: 'abc',
              });
            })
          )
        }
        media={{
          allowMediaSingle: true,
          allowResizing: true,
          customMediaPicker: {
            on: () => console.log('on'),
            removeAllListeners: () => console.log('removeAllListeners'),
            emit: () => console.log('emit'),
            destroy: () => console.log('destroy'),
            setUploadParams: () => console.log('setUploadParams'),
          },
          provider: new Promise(r =>
            r({
              uploadMediaClientConfig: {
                authProvider: auth,
                getAuthFromContext: auth,
                userAuthProvider: auth,
              },
              uploadParams: {},
              viewMediaClientConfig: {
                authProvider: auth,
                getAuthFromContext: auth,
                userAuthProvider: auth,
              },
            })
          ),
        }}
      />
    </div>
  );
};
