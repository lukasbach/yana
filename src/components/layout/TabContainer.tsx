import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import cxs from 'cxs';
import Color from 'color';
import { Colors } from '../../colors';
import { useTheme } from '../../common/theming';
import { useMainContentContext } from '../mainContent/context';
import { pages } from '../../pages';
import cx from 'classnames';
import { Icon } from '@blueprintjs/core';

const styles = {
  tab: cxs({
    padding: '8px 16px',
    marginLeft: '8px',
    cursor: 'pointer !important',
    position: 'relative',
    ':hover': {
      '> div': {
        opacity: 1
      }
    }
  }),
  draggingTab: cxs({
    borderRadius: '6px',
    boxShadow: '0px 2px 3px 1px rgba(0,0,0,.3)',
  }),
  closeContainer: cxs({
    position: 'absolute',
    top: 0,
    right: '4px',
    padding: '4px 2px 4px 2px',
    marginTop: '2px',
    opacity: 0,
    transition: '.1s all ease',
    ':hover': {
      color: 'white'
    }
  }),
  tabsContainer: cxs({
    display: 'flex',
    WebkitAppRegion: 'no-drag',
    userSelect: 'none'
  }),
};

export const TabContainer: React.FC<{}> = props => {
  const theme = useTheme();
  const mainContent = useMainContentContext();

  return (
    <DragDropContext onDragEnd={(result, provided) => {
      if (result.destination?.index !== undefined) {
        mainContent.reorderTab(result.source.index, result.destination.index);
      }
    }}>
      <Droppable droppableId="tabs-droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            className={styles.tabsContainer}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {
              mainContent.tabs.map((tab, idx) => {
                const id = tab.dataItem?.id ?? tab.page ?? 'unknown';
                const name = tab.dataItem?.name ?? (tab.page ? pages[tab.page]?.title : 'Unknown name');

                return (
                  <Draggable key={id} draggableId={id} index={idx} disableInteractiveElementBlocking={true}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cx(
                          styles.tab,
                          snapshot.isDragging && styles.draggingTab,
                          cxs({
                            color: mainContent.openTabId === idx ? 'white' : Color(theme.topBarColor).lighten(1).toString(),
                            borderBottom: mainContent.openTabId === idx ? `4px solid ${theme.primaryColor}` : undefined,
                            fontWeight: mainContent.openTabId === idx ? 'bold' : 'normal',
                            backgroundColor: theme.topBarColor,
                            ':hover': {
                              borderBottom: mainContent.openTabId !== idx ? `4px solid white` : undefined,
                            }
                          })
                        )}
                        onClick={() => mainContent.activateTab(idx)}
                      >
                        { name.substr(0, 12) }{ name.length > 12 ? '...' : '' }
                        <div
                          className={cx(
                            styles.closeContainer,
                            cxs({
                              backgroundColor: theme.topBarColor
                            })
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            mainContent.closeTab(idx)
                          }}
                        >
                          <Icon icon={'cross'} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })
            }
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
