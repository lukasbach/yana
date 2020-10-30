import * as React from 'react';
import { useDevTools } from './DevToolsContextProvider';
import { useSettings } from '../../appdata/AppDataProvider';
import { DetailedListContainer } from '../common/DetailedListContainer';
import { DetailedListItem } from '../common/DetailedListItem';
import { Button } from '@blueprintjs/core';

export const DevToolsSidebar: React.FC<{}> = props => {
  const devtools = useDevTools();
  const settings = useSettings();

  return (
    <div>
      <DetailedListContainer>
        <DetailedListItem
          title={`${Object.keys(devtools.counters).length} Counters registered`}
          subtitle={'Click here to reset all counters'}
          onClick={() => devtools.resetAllCounters()}
          icon={'info-sign'}
        />
        { Object.keys(devtools.counters).filter(key => (devtools.counters[key] || 0) > 0).map(key => (
          <DetailedListItem
            key={key}
            title={key}
            rightText={(devtools.counters[key] || '') + ''}
            actionButtons={(
              <Button
                icon={'trash'}
                onClick={() => devtools.resetCounter(key)}
              />
            )}
          />
        )) }
      </DetailedListContainer>
    </div>
  );
};
