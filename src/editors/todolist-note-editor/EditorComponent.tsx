import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { EditorComponentProps } from '../EditorDefinition';
import cxs from 'cxs';
import { LogService } from '../../common/LogService';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { HTMLSelect, ResizeSensor } from '@blueprintjs/core';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import * as monacoEditor from 'monaco-editor';
import { useSettings } from '../../appdata/AppDataProvider';
import { useScreenView } from '../../components/telemetry/useScreenView';
import { TodoListNoteEditorContent } from './TodolistNoteEditor';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ListItem } from './components/ListItem';
import { ListItemUi } from './components/ListItemUi';
import { v4 as uuid } from 'uuid';
import { ConfigurationHeader } from './components/ConfigurationHeader';
import { SortCriterium } from './sortCriteria';

const logger = LogService.getLogger('TodoListEditorComponent');

const styles = {
  container: cxs({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 40px',
    boxShadow: '0px 3px 4px -2px rgba(0,0,0,.2) inset',
    backgroundColor: 'rgb(240,240,240)',
    overflow: 'auto',
    position: 'absolute',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
  }),
};

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const EditorComponent: React.FC<EditorComponentProps<TodoListNoteEditorContent>> = props => {
  const [content, setContent] = useState(props.content);
  const currentNoteValue = useRef<TodoListNoteEditorContent>(content);
  const [hideCompletedItems, setHideCompletedItems] = useState(false);
  const [sortCriterium, setSortCriterium] = useState<SortCriterium | undefined>();
  const [sortAsc, setSortAsc] = useState(false);
  const settings = useSettings();

  useScreenView('todolist-note-editor');

  useEffect(() => {
    currentNoteValue.current = content;
    props.onChange();
  }, [content]);

  useEffect(() => {
    props.onRegister(async () => currentNoteValue.current);
  }, []);

  useEffect(() => () => {
    props.onDismount(currentNoteValue.current);
  }, []);

  return (
    <div className={styles.container}>
      <ConfigurationHeader
        changeSorting={(criterium, asc) => {
          setSortCriterium(criterium);
          setSortAsc(asc);
          setContent(content => ({
            items: content.items.sort((a, b) => criterium.compare(a, b) * (asc ? 1 : -1))
          }));
        }}
        toggleHideCompletedItems={() => setHideCompletedItems(x => !x)}
        hideCompletedItems={hideCompletedItems}
        asc={sortAsc}
        sortCriterium={sortCriterium}
        totalItems={content.items.length}
        completedItems={content.items.filter(i => (i.tickedOn || 0) > 0).length}
      />
      <DragDropContext onDragEnd={(result, provided) => {
        setContent(content => ({
          items: !result.destination ? content.items : reorder(content.items, result.source.index, result.destination.index)
        }));
        setSortCriterium(undefined);
        setSortAsc(false);
      }}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {content.items.filter(item => !hideCompletedItems || !item.tickedOn).map((item, index) => (
                <ListItem
                  item={item}
                  index={index}
                  onChangeItem={changedItem => {
                    setContent(content => ({
                      items: content.items.map((old, idx) => idx === index ? changedItem : old)
                    }))
                  }}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ListItemUi
        title="Add task"
        icon="add"
        isAddItem={true}
        onRename={title => {
          setContent(content => ({
            items: [
              ...content.items,
              {
                title,
                id: uuid(),
                description: '',
                starred: false,
                steps: [],
                tickedOn: undefined
              }
            ]
          }))
        }}
      />
    </div>
  );
};
