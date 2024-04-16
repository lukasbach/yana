import * as React from 'react';
import cxs from 'cxs';
import { Campaign as CampaignComponent } from '@lukasbach/campaigns-react';
import { Button } from '@blueprintjs/core';
import { useSettings } from '../../appdata/AppDataProvider';
import * as remote from '@electron/remote';

const styles = {
  text: cxs({
    color: '#5a5a5a',
    fontSize: '.85em',
  }),
};

export const Campaign: React.FC<{}> = props => {
  const settings = useSettings();

  if (!settings.campaigns) {
    return null;
  }

  return (
    <CampaignComponent
      changeInterval={60 * 2}
      dontRenderIfLoading={true}
      weighted={true}
      ignore={['yana']}
      render={campaign => (
        <Button
          small={true}
          minimal={true}
          icon="link"
          onClick={() => {
            if (campaign) {
              remote.shell.openExternal(campaign.url);
            }
          }}
        >
          <span className={styles.text}>
            {campaign?.product}: {campaign?.short}
          </span>
        </Button>
      )}
    />
  );
};
