import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsClickable } from '../layout/SettingsClickable';
import pkg from '../../../../package.json';
import { remote } from 'electron';

export const AboutYanaPage: React.FC<{}> = props => {

  return (
    <div>
      <SettingsSection title="About Yana">
        <SettingsClickable
          title="Yana version"
          subtitle={pkg.version}
          icon={'info-sign'}
        />
        <SettingsClickable
          title="View GitHub Repository"
          subtitle="https://github.com/lukasbach/yana"
          onClick={() => remote.shell.openExternal('https://github.com/lukasbach/yana')}
          icon={'globe'}
        />
      </SettingsSection>

      <SettingsSection title="Maintainers">
        <SettingsClickable
          title="Lukas Bach"
          subtitle="lukasbach.com"
          rightText="lbach@outlook.de"
          onClick={() => remote.shell.openExternal('https://lukasbach.com')}
          icon={'user'}
        />
      </SettingsSection>
    </div>
  );
};
