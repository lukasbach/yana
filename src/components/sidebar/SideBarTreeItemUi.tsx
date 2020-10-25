import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import { Classes, Icon, IconName, Popover } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useContextMenu } from '../useContextMenu';

const styles = {
  itemContainer: cxs({
    margin: '0 10px 0 10px',
    padding: '4px 12px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    transition: '.1s all ease',
    ':hover': {
      '> .more': {
        opacity: 1
      }
    }
  }),
  itemContainerActive: cxs({
    backgroundColor: 'white',
    color: '#333',
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
    display: 'flex',
    '> .bp3-icon': {
      marginRight: '4px'
    }
  }),
  nameContainer: cxs({
    position: 'relative',
    flexGrow: 1,
  }),
  nameContainerInner: cxs({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    '> span:not(.bp3-icon)': {
      ':hover': {
        textDecoration: 'underline'
      }
    },
  }),
  contextMenuContainer: cxs({
    opacity: 0,
    transition: '.1s all ease',
  }),
  nameChangeContainer: cxs({
    display: 'inline-flex',
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
  onClick?: () => any;
  onMiddleClick?: () => any;
  onTitleClick?: () => any;
  menu?: JSX.Element;
  isActive?: boolean;
  icon: IconName;
  iconColor?: string;
}> = props => {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(props.isActive || false);
  const [name, setName] = useState(props.text);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const contextMenuProps = useContextMenu(props.menu);
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
            backgroundColor: !props.isActive ? theme.sidebarHoverColor : undefined,
          }
        }),
      )}
      onClick={(e) => {
        props.onClick?.();
      }}
      onMouseDown={e => {
        if (e.button === 1) {
          // Middle click
          e.stopPropagation();
          e.preventDefault();
          props.onMiddleClick?.();
        }
      }}
      {...contextMenuProps}
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
        <Icon icon={props.icon} color={props.iconColor} />
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
              <div className={styles.nameContainer}>
                <span
                  className={cx(Classes.TEXT_OVERFLOW_ELLIPSIS, styles.nameContainerInner)}
                >
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
                </span>
              </div>
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
