import * as React from 'react';
import cxs from 'cxs';
import { Classes, EditableText, FormGroup, InputGroup } from '@blueprintjs/core';
import { UploadEntity } from './UploadEntity';
import { AutoSizer } from 'react-virtualized';

const styles = {
  container: cxs({
    display: 'flex',
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    marginBottom: '16px'
  }),
  previewImage: cxs({
    width: '120px',
    maxHeight: '180px',
    marginRight: '12px',
  }),
  content: cxs({
    flex: '1',
    ' h2': {
      margin: 0,
    }
  })
}

export const FilePreview: React.FC<{
  file: UploadEntity;
  onRemove: () => any;
  onChange: (changed: UploadEntity) => any;
}> = props => {
  const {file} = props;


  return (
    <div className={styles.container}>
      <div>
        { ["image/png"].includes(file.file.type) ? (
          <img
            src={"file:///" + file.file.path.replace(/\\/g, '/')}
            className={styles.previewImage}
          />
        ) : <div className={styles.previewImage} /> }
      </div>

      <div className={styles.content}>
        <AutoSizer>
          {({width, height}) => (
            <div>
              <h2 style={{ width, height: '20px' }}>
                <EditableText
                  defaultValue={file.name}
                  onConfirm={name => props.onChange({...props.file, name})}
                />
              </h2>
              <p className={Classes.TEXT_MUTED + ' ' + Classes.TEXT_OVERFLOW_ELLIPSIS} style={{ width }}>{ file.file.path }</p>
            </div>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};
