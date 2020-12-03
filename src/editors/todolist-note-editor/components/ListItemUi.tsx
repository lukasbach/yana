import * as React from 'react';
import cxs from 'cxs';
import { DOMAttributes, HTMLAttributes, LegacyRef, useRef, useState } from 'react';
import cx from 'classnames';
import { EditableText, Icon, IconName } from '@blueprintjs/core';
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

const DRAG_CONTAINER_CLASS = '__drag_container';
const BUTTON_CONTAINER_CLASS = '__button_container';
const HEIGHT = '50px';

const styles = {
  container: cxs({
    overflow: 'hidden',
    backgroundColor: '#fff',
    height: HEIGHT,
    minHeight: HEIGHT,
    boxShadow: '0px 2px 3px 1px #bbb',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    marginBottom: '10px',
    paddingLeft: '14px',
    [':hover .' + DRAG_CONTAINER_CLASS]: {
      width: 'auto !important',
      opacity: '1 !important'
    },
    [':hover .' + BUTTON_CONTAINER_CLASS]: {
      width: 'auto !important',
    }
  }),
  forceDisplay: cxs({
    width: 'auto !important',
    opacity: '1 !important'
  }),
  paddingChild: cxs({
//     paddingTop: '8px',
//     paddingBottom: '8px',
  }),
  containerClickable: cxs({
    cursor: 'pointer',
  }),
  containerInteractive: cxs({

  }),
  containerDragging: cxs({

  }),
  iconContainer: cxs({
    padding: '0px 14px 0px 4px'
  }),
  titleContainer: cxs({
    flexGrow: 1,
  }),
  dragContainer: cxs({
    width: '0px',
    opacity: '0',
    transition: '.06s all ease',
    overflow: 'hidden'
  }),
  input: cxs({
  //   padding: '10px 0',
    height: HEIGHT,
    border: 'none',
    backgroundColor: 'transparent',
    width: '100%',
  }),
  buttonContainer: cxs({
    width: '0px',
    overflowX: 'hidden',
    transition: '.1s all ease',
    display: 'flex',
  }),
  buttonContainerVisible: cxs({
    width: 'auto !important',
  }),
  button: cxs({
    height: HEIGHT,
    padding: '0 16px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    border: 'none',
    transition: '.1s all ease',
    ':hover': {
      backgroundColor: '#eee',
    },
    ':active': {
      backgroundColor: '#d7d7d7'
    }
  }),
  expansionContent: cxs({
    height: '0px',
    overflow: 'hidden',
    transition: '.2s all ease',
    marginLeft: '36px',
    marginRight: '36px',
    backgroundColor: '#fff',
    marginTop: '-10px',
    marginBottom: '10px',
  }),
  expansionContentOpen: cxs({
    height: 'auto !important',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    boxShadow: '0px 3px 3px 1px #bbb',
    marginBottom: '20px',
    padding: '8px 16px',
  })
};

export const ListItemUi: React.FC<{
  isDragging?: boolean,
  innerRef?: (element?: HTMLElement | null) => any;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  draggable?: boolean,
  icon?: IconName,
  title: string,
  selected?: boolean,
  onRename?: (renamed: string) => void,
  onToogleSelect?: (selected: boolean) => void,
  isAddItem?: boolean,
  expansionContent?: React.ReactNode,
  isStarred?: boolean,
  onToggleStar?: (star: boolean) => void,
  categoryColor?: string,
}> = props => {
  const [title, setTitle] = useState(props.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const [forceDisplay, setForceDisplay] = useState(false);
  const itemRef = useRef<HTMLInputElement>(null);

  const onSubmit = () => {
    setForceDisplay(false);
    if (title !== props.title) {
      props.onRename?.(title);
      if (props.isAddItem) {
        setTitle(props.title);
        itemRef.current?.focus();
        setTimeout(() => itemRef.current?.select());
      }
    }
  };

  return (
    <>
      <div
        ref={props.innerRef}
        className={cx(
          styles.container,
          props.isDragging && styles.containerDragging,
          props.draggable && styles.containerInteractive,
          cxs({
            borderLeft: `6px solid ${props.categoryColor || '#fff'}`
          }),
        )}
        {...(props.draggableProps ?? {})}
      >
        <div
          className={cx(styles.iconContainer, styles.paddingChild)}
          onClick={() => {
            if (props.onToogleSelect) {
              props.onToogleSelect(!props.selected);
            }
          }}
        >
          { props.icon && (
            <Icon icon={props.icon} />
          ) }
          { props.onToogleSelect && (
            <Icon
              icon={props.selected ? 'tick-circle' : 'circle'}
              iconSize={24}
            />
          ) }
        </div>
        { props.draggable && (
          <div
            {...(props.dragHandleProps ?? {})}
            className={cx(
              styles.dragContainer,
              styles.paddingChild,
              DRAG_CONTAINER_CLASS,
              forceDisplay && styles.forceDisplay
            )}
          >
            <Icon icon="menu" />&nbsp;&nbsp;
          </div>
        )}
        <div className={cx(styles.titleContainer, styles.paddingChild)}>
          <input
            className={styles.input}
            ref={itemRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={e => {
              itemRef.current?.select();
              setForceDisplay(true);
            }}
            onBlur={onSubmit}
            onKeyDown={e => {
              if (e.key.toLowerCase() === 'enter') {
                onSubmit();
                setForceDisplay(true);
              }
            }}
          />
        </div>
        { props.isAddItem && forceDisplay && (
          <div className={cx(styles.buttonContainer, styles.buttonContainerVisible)}>
            <button className={cx(styles.button, styles.paddingChild)}>
              <Icon icon={'tick'} iconSize={16} />
            </button>
          </div>
        )}
        { props.onToggleStar && props.isStarred && (
          <div className={cx(styles.buttonContainer, styles.buttonContainerVisible)}>
            <button
              className={cx(styles.button, styles.paddingChild)}
              onClick={() => props.onToggleStar?.(!props.isStarred)}
            >
              <Icon icon={props.isStarred ? 'star' : 'star-empty'} iconSize={16} />
            </button>
          </div>
        )}
        <div className={cx(
          styles.buttonContainer,
          BUTTON_CONTAINER_CLASS,
          forceDisplay && styles.forceDisplay
        )}>
          { props.onToggleStar && !props.isStarred && (
            <button
              className={cx(styles.button, styles.paddingChild)}
              onClick={() => props.onToggleStar?.(!props.isStarred)}
            >
              <Icon icon={props.isStarred ? 'star' : 'star-empty'} iconSize={16} />
            </button>
          ) }
          { props.expansionContent && (
            <button
              className={styles.button}
              onClick={() => {
                setIsExpanded(!isExpanded);
                setForceDisplay(!isExpanded);
              }}
            >
              { isExpanded ? 'Close' : 'Details...' }
              &nbsp;&nbsp;
              <Icon icon={isExpanded ? 'chevron-up' : 'chevron-down'} />
            </button>
          ) }
        </div>
      </div>
      { props.expansionContent && (
        <div className={cx(
          styles.expansionContent,
          isExpanded && styles.expansionContentOpen
        )}>
          { props.expansionContent }
        </div>
      ) }
    </>
  );
};
