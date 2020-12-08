import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';
import { Button } from '@blueprintjs/core';
import { DataItemKind } from '../../types';
import { TelemetryService } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useMainContentContext } from '../mainContent/context';

export const DraftItems: React.FC<{}> = props => {
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  useScreenView('draft-items');
  return (
    <SearchView
      title="Draft Items"
      icon="edit"
      hiddenSearch={{ tags: [InternalTag.Draft], notTags: [InternalTag.Trash] }}
      defaultSearch={{}}
      rightContent={(
        <Button
          outlined icon={'add'}
          onClick={() => {
            dataInterface.createDataItem({
              name: 'New Draft',
              tags: [InternalTag.Draft],
              kind: DataItemKind.NoteItem,
              childIds: [],
              lastChange: new Date().getTime(),
              created: new Date().getTime(),
              noteType: 'atlaskit-editor-note'
            } as any).then(item => mainContent.newTab(item));
            TelemetryService?.trackEvent(...TelemetryEvents.Items.createDraftItem);
          }}
        >
          Create new draft
        </Button>
      )}
    />
  );
};
