import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import { Icon, Popover } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';

const styles = {
  itemContainer: cxs({
    margin: '0 10px 0 10px',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    ':hover': {
      '> .more': {
        opacity: 1
      }
    }
  }),
  itemContainerActive: cxs({
    '> .more': {
      opacity: 1
    }
  }),
  chevronContainer: cxs({
    width: '18px',
    cursor: 'pointer'
  }),
  textContainer: cxs({
    flexGrow: 1,
    '> span': {
      ':hover': {
        textDecoration: 'underline'
      }
    }
  }),
  contextMenuContainer: cxs({
    opacity: 0
  }),
  nameChangeContainer: cxs({
    display: 'flex',
    margin: 0,
    '> input': {
      flexGrow: 1,
      border: 'none',
      backgroundColor: 'transparent',
      color: 'white',
      outline: 'none'
    },
    '> button': {
      border: 'none',
      backgroundColor: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      ':hover': {
        color: 'white'
      }
    }
  })
}

export const SideBarTreeItemUi: React.FC<{
  text: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isRenaming?: boolean;
  onRename?: (newName: string) => any;
  onExpand?: () => any;
  onCollapse?: () => any;
  onClick?: () => any;
  onMiddleClick?: () => any;
  onTitleClick?: () => any;
  menu?: JSX.Element;
  isActive?: boolean;
}> = props => {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(props.isActive || false);
  const [name, setName] = useState(props.text);
  const renameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setIsActive(props.isActive !== undefined ? props.isActive : isActive), [props.isActive]);
  useEffect(() => {
    if (props.isRenaming) {
      setName(props.text);
      renameInputRef.current?.select();
    }
  }, [props.isRenaming]);

  return (
    <div
      className={cx(
        styles.itemContainer,
        isActive && styles.itemContainerActive,
        cxs({
          color: theme.sidebarTextColor,
          ':hover': {
            backgroundColor: theme.sidebarHoverColor,
          }
        }),
      )}
      onClick={(e) => {
        if (props.isExpandable) {
          props.isExpanded ? props.onCollapse?.() : props.onExpand?.();
        } else {
          props.onClick?.();
        }
      }}
      onMouseDown={e => {
        if (e.button === 1) {
          // Middle click
          e.stopPropagation();
          e.preventDefault();
          props.onMiddleClick?.();
        }
      }}
    >
      <div
        className={styles.chevronContainer}
      >
        {
          props.isExpandable && (
            <Icon
              icon={props.isExpanded ? 'chevron-down' : 'chevron-right'}
            />
          )
        }
      </div>

      <div
        className={styles.textContainer}
      >
          {
            props.isRenaming ? (
              <form
                className={styles.nameChangeContainer}
                onSubmit={() => props.onRename?.(name)}
                onClick={e => e.stopPropagation()}
              >
                <input
                  ref={renameInputRef}
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                />
                <button type="submit">
                  <Icon icon="tick" />
                </button>
              </form>
            ) : (
              <span
                onClick={e => {
                  e.stopPropagation();
                  if (props.onTitleClick) {
                    props.onTitleClick();
                  } else {
                    props.onClick?.();
                  }
                }}
              >
                { props.text }
              </span>
            )
          }
      </div>

      {
        props.menu && !props.isRenaming && (
          <div
            className={cx(
              styles.contextMenuContainer,
              'more'
            )}
            onClick={e => e.stopPropagation()}
          >
            <Popover
              content={props.menu}
              onOpening={() => setIsActive(true)}
              onClose={() => setIsActive(props.isActive || false)}
              position={'bottom'}
              minimal
            >
              <Icon icon={'more'} />
            </Popover>
          </div>
        )
      }
    </div>
  );
};
