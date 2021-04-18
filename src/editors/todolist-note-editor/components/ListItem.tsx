import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import cxs from 'cxs';
import cx from 'classnames';
import { TodoListItem } from '../TodolistNoteEditor';
import { ListItemUi } from './ListItemUi';
import { Button, ButtonGroup, EditableText, Icon } from '@blueprintjs/core';
import { ColorSelection } from './ColorSelection';
import { defaultTheme } from '../../../common/theming';

const styles = {
  descriptionContainer: cxs({
    margin: '16px 0',
  }),
};

export const ListItem: React.FC<{
  item: TodoListItem;
  index: number;
  onChangeItem: (item: TodoListItem) => void;
}> = ({ item, index, onChangeItem }) => {
  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItemUi
          categoryColor={item.color || defaultTheme.primaryColor}
          innerRef={provided.innerRef}
          draggableProps={provided.draggableProps}
          dragHandleProps={provided.dragHandleProps}
          draggable={true}
          title={item.title}
          selected={!!item.tickedOn}
          onToogleSelect={selected =>
            onChangeItem({
              ...item,
              tickedOn: selected ? Date.now() : undefined,
            })
          }
          expansionContent={
            <>
              <div>
                <ColorSelection selectedColor={item.color} onSelectColor={color => onChangeItem({ ...item, color })} />
                <div className={styles.descriptionContainer}>
                  <EditableText
                    defaultValue={item.description}
                    onConfirm={description => onChangeItem({ ...item, description })}
                    onCancel={description => onChangeItem({ ...item, description })}
                    placeholder="Item Description"
                    confirmOnEnterKey={false}
                    multiline={true}
                  />
                </div>
              </div>
            </>
          }
          isStarred={item.starred}
          onToggleStar={starred => onChangeItem({ ...item, starred })}
        />
      )}
    </Draggable>
  );
};
