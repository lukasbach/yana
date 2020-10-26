import * as React from 'react';
import { useEffect, useState } from 'react';
import { NoteDataItem } from '../../types';
import { Button, EditableText, Icon, IconName, Intent, Popover, Tag, Tooltip } from '@blueprintjs/core';
import cxs from 'cxs';
import Color from 'color';
import { TagList } from '../common/TagList';
import ago from 's-ago';
import { useEditItemDrawer } from '../drawers/editItemDrawer/useEditItemDrawer';
import { PageHeader } from '../common/PageHeader';
import { InternalTag } from '../../datasource/InternalTag';
import { SaveIndicatorState } from './EditorContainer';

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
  saveIndicator?: SaveIndicatorState,
}> = props => {
  const { lastChange, created } = props.dataItem;
  const [titleValue, setTitleValue] = useState(props.dataItem.name);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const { EditItemDrawer, onOpenEditItemDrawer } = useEditItemDrawer(props.dataItem.id);
  const [saveIndicator, setSaveIndicator] = useState<SaveIndicatorState>(SaveIndicatorState.Saved);
  useEffect(() => setTitleValue(props.dataItem.name), [props.dataItem.id]);

  useEffect(() => {
    if (props.saveIndicator === SaveIndicatorState.Saved && saveIndicator !== SaveIndicatorState.Saved) {
      setSaveIndicator(SaveIndicatorState.RecentlySaved);
      const timeout = setTimeout(() => setSaveIndicator(SaveIndicatorState.Saved), 1000);
      return () => clearTimeout(timeout);
    } else if (props.saveIndicator) {
      setSaveIndicator(props.saveIndicator);
    }
  }, [props.saveIndicator]);

  let saveIndicatorText: string = 'Unknown save state';
  let saveIndicatorIcon: IconName | undefined;
  let saveIndicatorIntent: Intent = 'none';

  switch (saveIndicator) {
    case SaveIndicatorState.Saved:
      saveIndicatorText = 'Unchanged';
      break;
    case SaveIndicatorState.Unsaved:
      saveIndicatorText = 'Changed';
      saveIndicatorIcon = 'edit';
      break;
    case SaveIndicatorState.Saving:
      saveIndicatorText = 'Saving...';
      saveIndicatorIcon = 'floppy-disk';
      saveIndicatorIntent = 'primary';
      break;
    case SaveIndicatorState.RecentlySaved:
      saveIndicatorText = 'Saved';
      saveIndicatorIcon = 'tick-circle';
      saveIndicatorIntent = 'success';
      break;

  }

  const isStarred = props.dataItem.tags.includes(InternalTag.Starred);

  return (
    <>
      <PageHeader
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
            <Tooltip content={new Date(lastChange).toLocaleString()} position={'bottom'}>{ ago(new Date(lastChange)) }</Tooltip>,{' '}
            created{' '}
            <Tooltip content={new Date(created).toLocaleString()} position={'bottom'}>{ ago(new Date(created)) }</Tooltip>.{' '}
            <Tag children={saveIndicatorText} intent={saveIndicatorIntent} icon={<Icon icon={saveIndicatorIcon} iconSize={10} />} minimal />
          </>
        )}
        rightContent={(
          <>
            <div>
              <Button outlined icon={'tag'} onClick={() => setIsEditingTags(true)}>Edit Tags</Button>{' '}
              <Button outlined icon={'cog'} onClick={onOpenEditItemDrawer}>Configure document</Button>{' '}
            </div>
            {!isEditingTags && (
              <div>
                <TagList
                  dataItem={props.dataItem}
                  isEditing={false}
                  onStopEditing={() => setIsEditingTags(false)}
                />
              </div>
            )}
          </>
        )}
        lowerContent={isEditingTags && (
          <TagList
            dataItem={props.dataItem}
            isEditing={true}
            onStopEditing={() => setIsEditingTags(false)}
          />
        )}
      />
    <EditItemDrawer />
    </>
  );
};
