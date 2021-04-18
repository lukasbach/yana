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
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { DataItemContextMenu } from '../menus/DataItemContextMenu';
import { useMainContentContext } from './context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useOverlaySearch } from '../overlaySearch/OverlaySearchProvider';
import { TelemetryService } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';
import { promptMoveItem } from '../../datasource/promptMoveItem';
import { SaveIndicator } from './SaveIndicator';
import { Campaign } from '../notifications/Campaign';

export const EditorHeader: React.FC<{
  dataItem: NoteDataItem<any>;
  onChange: (changed: NoteDataItem<any>) => Promise<void>;
  saveIndicator?: SaveIndicatorState;
}> = props => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const overlaySearch = useOverlaySearch();
  const { lastChange, created } = props.dataItem;
  const [titleValue, setTitleValue] = useState(props.dataItem.name);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const { EditItemDrawer, onOpenEditItemDrawer } = useEditItemDrawer(props.dataItem.id);
  useEffect(() => setTitleValue(props.dataItem.name), [props.dataItem.id]);

  const isStarred = props.dataItem.tags.includes(InternalTag.Starred);

  return (
    <>
      <PageHeader
        title={
          <>
            <EditableText
              value={titleValue}
              onChange={setTitleValue}
              onConfirm={name => props.onChange({ ...props.dataItem, name })}
            />
            <Button
              style={{ marginLeft: '12px' }}
              icon={isStarred ? 'star' : 'star-empty'}
              onClick={() => {
                props.onChange({
                  ...props.dataItem,
                  tags: isStarred
                    ? props.dataItem.tags.filter(tag => tag !== InternalTag.Starred)
                    : [...props.dataItem.tags, InternalTag.Starred],
                });

                if (isStarred) {
                  TelemetryService?.trackEvent(...TelemetryEvents.Items.unStarFromNoteContainer);
                } else {
                  TelemetryService?.trackEvent(...TelemetryEvents.Items.starFromNoteContainer);
                }
              }}
              minimal
              large
            />
          </>
        }
        icon={(props.dataItem.icon as any) || 'document'}
        iconColor={props.dataItem.color}
        titleSubtext={
          <>
            Edited{' '}
            <Tooltip content={new Date(lastChange).toLocaleString()} position={'bottom'}>
              {ago(new Date(lastChange))}
            </Tooltip>
            , created{' '}
            <Tooltip content={new Date(created).toLocaleString()} position={'bottom'}>
              {ago(new Date(created))}
            </Tooltip>
            . <SaveIndicator saveIndicator={props.saveIndicator} />
          </>
        }
        rightContent={
          <>
            <div>
              {props.dataItem.tags.includes(InternalTag.Draft) && (
                <Button
                  outlined
                  icon="arrow-right"
                  onClick={() => {
                    promptMoveItem(dataInterface, overlaySearch, props.dataItem);
                  }}
                >
                  Mount draft to folder
                </Button>
              )}{' '}
              <Button outlined icon={'tag'} onClick={() => setIsEditingTags(true)}>
                Edit Tags
              </Button>{' '}
              <Button outlined icon={'cog'} onClick={onOpenEditItemDrawer}>
                Configure document
              </Button>{' '}
              <Popover
                interactionKind={'click'}
                position={'bottom'}
                captureDismiss={true}
                content={
                  <DataItemContextMenu
                    item={props.dataItem}
                    renderer={Bp3MenuRenderer}
                    mainContent={mainContent}
                    dataInterface={dataInterface}
                    overlaySearch={overlaySearch}
                  />
                }
              >
                <Button outlined rightIcon={'chevron-down'}>
                  More
                </Button>
              </Popover>
            </div>
            {!isEditingTags && (
              <div>
                {props.dataItem.tags.length > 0 ? (
                  <TagList dataItem={props.dataItem} isEditing={false} onStopEditing={() => setIsEditingTags(false)} />
                ) : (
                  <Campaign />
                )}
              </div>
            )}
          </>
        }
        lowerContent={
          isEditingTags && (
            <TagList dataItem={props.dataItem} isEditing={true} onStopEditing={() => setIsEditingTags(false)} />
          )
        }
      />
      <EditItemDrawer />
    </>
  );
};
