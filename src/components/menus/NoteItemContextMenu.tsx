import * as React from 'react';
import { DataItem, NoteDataItem } from '../../types';
import { MenuRenderer } from './types';
import {
  MainContentContextType,
} from '../mainContent/context';
import { Alerter } from '../Alerter';
import { DataInterface } from '../../datasource/DataInterface';

export const NoteItemContextMenu: React.FC<{
  item: NoteDataItem<any>;
  renderer: MenuRenderer;
  onStartRename?: () => void;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
}> = ({ renderer, item, onStartRename, dataInterface, mainContent }) => {
  // const mainContent = useMainContentContext();
  // const dataInterface = useDataInterface();

  const Renderer = renderer;

  return (
    <>
      <Renderer
        menu={{
          childs: [
            { text: 'Open', icon: 'document-open', onClick: () => {console.log("!!!", item);mainContent.openInCurrentTab(item)}  },
            { text: 'Open in new Tab', icon: 'document-open', onClick: () => mainContent.newTab(item)  },
            { text: 'Rename', icon: 'edit', onClick: onStartRename ?? (() => Alerter.Instance.alert({
              content: <>Rename item <b>{item.name}</b>:</>,
              prompt: {
                defaultValue: item.name,
                placeholder: item.name,
                onConfirmText: name => !!name.length && dataInterface.changeItem(item.id, { name })
              },
              icon: 'edit',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Rename'
            })) },
            { text: 'Delete', icon: 'trash', intent: 'danger', onClick: () => Alerter.Instance.alert({
              content: <>Are you sure you want to delete <b>{item.name}</b>?</>,
              onConfirm: () => dataInterface.removeItem(item.id),
              intent: 'danger',
              icon: 'trash',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Delete'
              })
            },
          ]
        }}
      />
    </>
  );
};
