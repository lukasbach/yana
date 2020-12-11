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
import { AdvancedSettings } from './pages/AdvancedSettings';
import { SidebarSettings } from './pages/SidebarSettings';
import { LogService } from '../../common/LogService';
import { SpellingSettings } from './pages/SpellingSettings';
import { useTelemetry } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';
import { remote } from 'electron';

export const Settings: React.FC<{}> = props => {
  const appData = useAppData();
  const [settings, setSettings] = useState(appData.settings);
  const [currentTab, setCurrentTab] = useState(SettingsTabs.General);
  const [dirty, setDirty] = useState(false);
  const telemetry = useTelemetry();

  const updateSettings = (changed: Partial<SettingsObject>) => {
    setSettings(v => ({ ...v, ...changed }));
    setDirty(true);
  };

  const saveSettings = async () => {
    setDirty(false);
    LogService.applySettings(settings);
    await appData.saveSettings(settings);

    remote.getCurrentWebContents().session
      .setSpellCheckerLanguages(settings.spellingActive ? settings.spellingLanguages : []);

    telemetry.trackEvent(...TelemetryEvents.Settings.saveSettings);
  }

  return (
    <SettingsContext.Provider
      value={{
        changeSettings: updateSettings,
        save: saveSettings,
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
          rightContent={dirty && <Button large outlined intent="primary" icon="floppy-disk" onClick={() => saveSettings()}>Save Settings</Button>}
          lowerContentFlush={true}
          lowerContent={(
            <Tabs onChange={(newTabId: SettingsTabs) => setCurrentTab(newTabId)} selectedTabId={currentTab}>
              <Tab id={SettingsTabs.General} title="General" />
              <Tab id={SettingsTabs.Sidebar} title="Sidebar" />
              <Tab id={SettingsTabs.Editors} title="Editors" />
              <Tab id={SettingsTabs.Spelling} title="Spelling" />
              <Tab id={SettingsTabs.Advanced} title="Advanced" />
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
            case SettingsTabs.Advanced:
              return <AdvancedSettings />;
            case SettingsTabs.Sidebar:
              return <SidebarSettings />;
            case SettingsTabs.Spelling:
              return <SpellingSettings />;
            case SettingsTabs.General:
            default:
              return <GeneralSettings />;
          }
        })()}
      </PageContainer>
    </SettingsContext.Provider>
  );
};
