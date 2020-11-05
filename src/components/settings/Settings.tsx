import * as React from 'react';
import { useState } from 'react';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import { Button, Tab, Tabs } from '@blueprintjs/core';
import { SettingsTabs } from './SettingsTabs';
import { SettingsContext } from './SettingsContext';
import { useAppData } from '../../appdata/AppDataProvider';
import { SettingsObject } from '../../settings/types';
import { GeneralSettings } from './pages/GeneralSettings';
import { EditorSettings } from './pages/EditorSettings';
import { DevSettings } from './pages/DevSettings';
import { SidebarSettings } from './pages/SidebarSettings';

export const Settings: React.FC<{}> = props => {
  const appData = useAppData();
  const [settings, setSettings] = useState(appData.settings);
  const [currentTab, setCurrentTab] = useState(SettingsTabs.General);
  const [dirty, setDirty] = useState(false);

  const updateSettings = (changed: Partial<SettingsObject>) => {
    setSettings(v => ({ ...v, ...changed }));
    setDirty(true);
  };

  return (
    <SettingsContext.Provider
      value={{
        changeSettings: updateSettings,
        save: () => {
          setDirty(false);
          return appData.saveSettings(settings);
        },
        createStringHandler: key => value => updateSettings({ [key]: value }),
        createIntHandler: key => value => updateSettings({ [key]: typeof value === 'string' ? parseInt(value) : value }),
        createFloatHandler: key => value => updateSettings({ [key]: typeof value === 'string' ? parseFloat(value) : value }),
        createBooleanHandler: key => value => updateSettings({ [key]: typeof value === 'boolean' ? value : value === 'true' }),
        dirty, settings
      }}
    >
      <PageContainer header={(
        <PageHeader
          title={ dirty ? 'Settings*' : 'Settings' }
          titleSubtext="Some settings might require restarting Yana to take effect."
          icon="cog"
          rightContent={dirty && <Button large outlined intent="primary" icon="floppy-disk" onClick={() => { setDirty(false); appData.saveSettings(settings); }}>Save Settings</Button>}
          lowerContentFlush={true}
          lowerContent={(
            <Tabs onChange={(newTabId: SettingsTabs) => setCurrentTab(newTabId)} selectedTabId={currentTab}>
              <Tab id={SettingsTabs.General} title="General" />
              <Tab id={SettingsTabs.Sidebar} title="Sidebar" />
              <Tab id={SettingsTabs.Editors} title="Editors" />
              <Tab id={SettingsTabs.Hotkeys} title="Hotkeys" />
              <Tab id={SettingsTabs.Devtools} title="Dev Tools" />
            </Tabs>
          )}
        />
      )}>
        {(() => {
          switch (currentTab) {
            case SettingsTabs.Editors:
              return <EditorSettings />;
            case SettingsTabs.Hotkeys:
              return <div />;
            case SettingsTabs.Devtools:
              return <DevSettings />;
            case SettingsTabs.Sidebar:
              return <SidebarSettings />;
            case SettingsTabs.General:
            default:
              return <GeneralSettings />;
          }
        })()}
      </PageContainer>
    </SettingsContext.Provider>
  );
};
