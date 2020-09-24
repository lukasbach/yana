import * as React from 'react';
import { NoteDataItem } from '../../types';
import { Button, EditableText, H1, Icon, Tag } from '@blueprintjs/core';
import cxs from 'cxs';
import { useEffect, useState } from 'react';
import Color from 'color';
import { TagList } from './TagList';
import ago from 's-ago';

const styles = {
  container: cxs({
    margin: '56px 32px 16px 32px',
    display: 'flex'
  }),
  leftContainer: cxs({
    flexGrow: 1
  }),
  rightContainer: cxs({
    textAlign: 'right',
    '> div': {
      marginBottom: '4px',
    }
  }),
  title: cxs({
    fontWeight: 400,
    fontSize: '32px',
    margin: 0,
    '> span': {
      margin: '2px 14px 0 0px'
    }
  }),
  titleSubtext: cxs({
    color: Color('#fff').darken(.35).toString(),
    fontSize: '12px',
    margin: '12px 0 0 0'
  })
}

export const EditorHeader: React.FC<{
  dataItem: NoteDataItem<any>,
  onChange: (changed: NoteDataItem<any>) => Promise<void>,
}> = props => {
  const { lastChange, created } = props.dataItem;
  const [titleValue, setTitleValue] = useState(props.dataItem.name);
  const [isEditingTags, setIsEditingTags] = useState(false);
  useEffect(() => setTitleValue(props.dataItem.name), [props.dataItem.id]);

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h1 className={styles.title}>
          <Icon icon={'document'} iconSize={32} />
          <EditableText
            value={titleValue}
            onChange={setTitleValue}
            onConfirm={name => props.onChange({...props.dataItem, name})}
          />
        </h1>
        <p className={styles.titleSubtext}>
          Edited{' '}
          <span title={new Date(lastChange).toLocaleString()}>{ ago(new Date(lastChange)) }</span>,{' '}
          created{' '}
          <span title={new Date(created).toLocaleString()}>{ ago(new Date(created)) }</span>.
        </p>
      </div>
      <div className={styles.rightContainer}>
        <div>
          <Button outlined icon={'tag'} onClick={() => setIsEditingTags(true)}>Edit Tags</Button>{' '}
          <Button outlined icon={'cog'}>Configure document</Button>{' '}
        </div>
        <div>
          <TagList
            dataItem={props.dataItem}
            isEditing={isEditingTags}
            onStopEditing={() => setIsEditingTags(false)}
          />
        </div>
      </div>
    </div>
  );
};
