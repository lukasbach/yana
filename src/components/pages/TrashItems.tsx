import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';
import { Button } from '@blueprintjs/core';
import { Alerter } from '../Alerter';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

export const TrashItems: React.FC<{}> = props => {
  const dataInterface = useDataInterface();
  useScreenView('trash-items');

  return (
    <SearchView
      title="Trash"
      titleSubtext="You can restore or permanently remove items by right-clicking on them."
      icon="trash"
      hiddenSearch={{ tags: [InternalTag.Trash] }}
      defaultSearch={{}}
      rightContent={(
        <>
          <Button
            outlined icon="trash" intent="danger"
            onClick={async () => {
              await Alerter.Instance.alert({
                icon: 'trash',
                intent: 'danger',
                content: 'Do you want to permanently remove all items in your trash bin? The items cannot be recovered!',
                confirmButtonText: 'Remove permanently',
                cancelButtonText: 'Cancel',
                prompt: {
                  type: 'boolean',
                  defaultValue: true,
                  text: 'Recursively delete all children',
                  onConfirmBoolean: async (recursive) => {
                    const { results: items } = await dataInterface.search({ tags: [ InternalTag.Trash ] });
                    for (const item of items) {
                      await dataInterface.removeItem(item.id, recursive);
                    }
                  }
                }
              })
            }}
          >
            Clear trash
          </Button>
          {' '}
          <Button
            outlined icon="history"
            onClick={async () => {
              await Alerter.Instance.alert({
                icon: 'history',
                intent: 'warning',
                content: 'Do you want to move all items in the trash can back to their original location?',
                confirmButtonText: 'Recover all items',
                cancelButtonText: 'Cancel',
                onConfirm: async () => {
                  const { results: items } = await dataInterface.search({ tags: [ InternalTag.Trash ] });
                  for (const item of items) {
                    await dataInterface.changeItem(item.id, ({ tags }) => ({
                      tags: tags.filter(tag => tag !== InternalTag.Trash)
                    }));
                  }
                },
              })
            }}
          >
            Restore everything
          </Button>
        </>
      )}
    />
  );
};
