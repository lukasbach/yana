import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsClickable } from '../layout/SettingsClickable';
import pkg from '../../../../package.json';
import { remote } from "electron";

export const AboutDependenciesPage: React.FC<{}> = props => {

  return (
    <div>
      <SettingsSection title="Dependencies">
        <SettingsClickable
          title="The following projects are direct dependencies used by Yana"
          icon={'info-sign'}
        />
        {
          Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).map(dependency => (
            <SettingsClickable
              title={dependency}
              subtitle={(pkg.dependencies as any)[dependency] || (pkg.devDependencies as any)[dependency]}
              onClick={() => remote.shell.openExternal(`https://npmjs.com/package/${dependency}`)}
            />
          ))
        }
      </SettingsSection>
    </div>
  );
};
