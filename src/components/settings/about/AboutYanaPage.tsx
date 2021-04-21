import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsClickable } from '../layout/SettingsClickable';
import pkg from '../../../../package.json';
import { remote } from 'electron';
import cxs from 'cxs';

export const AboutYanaPage: React.FC<{}> = props => {
  return (
    <div>
      <SettingsSection title="About Yana">
        <SettingsClickable title="Yana version" subtitle={pkg.version} icon={'info-sign'} />
        <SettingsClickable
          title="View GitHub Repository"
          subtitle="https://github.com/lukasbach/yana"
          onClick={() => remote.shell.openExternal('https://github.com/lukasbach/yana')}
          icon={'globe'}
        />

        <SettingsClickable
          title="Report an issue"
          subtitle="https://github.com/lukasbach/yana/issues"
          onClick={() => remote.shell.openExternal('https://github.com/lukasbach/yana/issues')}
          icon={'issue'}
        />

        <p className={cxs({ marginTop: '10px' })}>
          We would be happy if you star Yana on Github if you enjoyed using it. Feel free to report
          any problems, feedback or thoughts!
        </p>
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
