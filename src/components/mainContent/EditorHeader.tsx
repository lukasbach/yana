import * as React from 'react';
import { NoteDataItem } from '../../types';
import { Button, Drawer, EditableText, H1, Icon, Tag } from '@blueprintjs/core';
import cxs from 'cxs';
import { useEffect, useState } from 'react';
import Color from 'color';
import { TagList } from './TagList';
import ago from 's-ago';
import { useEditItemDrawer } from '../drawers/editItemDrawer/useEditItemDrawer';
import { MainContentHeader } from './MainContentHeader';
import { InternalTag } from '../../datasource/InternalTag';

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
  const { EditItemDrawer, onOpenEditItemDrawer } = useEditItemDrawer(props.dataItem.id);
  useEffect(() => setTitleValue(props.dataItem.name), [props.dataItem.id]);

  const isStarred = props.dataItem.tags.includes(InternalTag.Starred);

  return (
    <>
      <MainContentHeader
        title={(
          <>
            <EditableText
              value={titleValue}
              onChange={setTitleValue}
              onConfirm={name => props.onChange({...props.dataItem, name})}
            />
            <Button
              style={{ marginLeft: '12px' }}
              icon={isStarred ? 'star' : 'star-empty'}
              onClick={() => props.onChange({
                ...props.dataItem,
                tags: isStarred ? props.dataItem.tags.filter(tag => tag !== InternalTag.Starred)
                  : [...props.dataItem.tags, InternalTag.Starred]
              })}
              minimal
              large
            />
          </>
        )}
        icon={props.dataItem.icon as any || 'document'}
        iconColor={props.dataItem.color}
        titleSubtext={(
          <>
            Edited{' '}
            <span title={new Date(lastChange).toLocaleString()}>{ ago(new Date(lastChange)) }</span>,{' '}
            created{' '}
            <span title={new Date(created).toLocaleString()}>{ ago(new Date(created)) }</span>.
          </>
        )}
        rightContent={(
          <>
            <div>
              <Button outlined icon={'tag'} onClick={() => setIsEditingTags(true)}>Edit Tags</Button>{' '}
              <Button outlined icon={'cog'} onClick={onOpenEditItemDrawer}>Configure document</Button>{' '}
            </div>
            <div>
              <TagList
                dataItem={props.dataItem}
                isEditing={isEditingTags}
                onStopEditing={() => setIsEditingTags(false)}
              />
            </div>
          </>
        )}
      />
    <EditItemDrawer />
    </>
  )

  /*return (
    <div className={styles.container}>
      <EditItemDrawer />
      <div className={styles.leftContainer}>
        <h1 className={styles.title}>
          <Icon icon={props.dataItem.icon as any || 'document'} color={props.dataItem.color} iconSize={32} />
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
          <Button outlined icon={'cog'} onClick={onOpenEditItemDrawer}>Configure document</Button>{' '}
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
  );*/
};
