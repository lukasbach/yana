import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsNumberInput } from '../layout/SettingsNumberInput';
import { SettingsClickable } from '../layout/SettingsClickable';
import { useMainContentContext } from '../../mainContent/context';
import { PageIndex } from '../../../PageIndex';
import * as remote from '@electron/remote';
import { AppDataExportService } from '../../../appdata/AppDataExportService';
import { useAppData } from '../../../appdata/AppDataProvider';
import { SettingsFilesystemPathInput } from '../layout/SettingsFilesystemPathInput';
import { SettingsColorInput } from '../layout/SettingsColorInput';
import { useSettingsPageContext } from '../SettingsContext';
import { defaultTheme } from '../../../common/theming';
import { useSpotlight } from '../../spotlight/SpotlightContainer';
import { SpotlightScenarioId } from '../../spotlight/SpotlightScenarioId';
import { ThemeButton } from '../layout/ThemeButton';
import { themes } from '../../../themes';
import { SettingsThemeSelection } from '../layout/SettingsThemeSelection';

export const GeneralSettings: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const app = useAppData();
  const settings = useSettingsPageContext();
  const spotlight = useSpotlight();

  return (
    <div>
      <SettingsSection title="General Settings">
        <SettingsNumberInput settingsKey={'zoomFactor'} label="Zoom Factor" step={0.1} min={0.4} max={5} />

        <SettingsClickable
          title="Restart Tutorial"
          subtitle="The tutorial explains the basics of Yana."
          icon={'reset'}
          onClick={() => {
            spotlight.startScenario(SpotlightScenarioId.SidebarScenario, true);
          }}
        />
      </SettingsSection>

      <SettingsSection title="Personalization">
        <SettingsThemeSelection
          currentTheme={{
            primaryColor: settings.settings.themePrimaryColor,
            sidebarColor: settings.settings.themeSidebarColor,
            sidebarTextColor: settings.settings.themeSidebarTextColor,
            sidebarHoverColor: settings.settings.themeSidebarHoverColor,
            topBarColor: settings.settings.themeTopbarColor,
          }}
          onChangeTheme={theme => {
            settings.changeSettings({
              themePrimaryColor: theme.primaryColor,
              themeSidebarColor: theme.sidebarColor,
              themeSidebarTextColor: theme.sidebarTextColor,
              themeSidebarHoverColor: theme.sidebarHoverColor,
              themeTopbarColor: theme.topBarColor,
            });
          }}
        />

        <p>After choosing a theme, you have to save the settings to see it applied.</p>
        <p>
          Nord theme is inspired by{' '}
          <a href="https://nordtheme.com" target="_blank">
            nordtheme.com
          </a>
        </p>

        <SettingsColorInput settingsKey={'themePrimaryColor'} label={'Primary Color'} />
        <SettingsColorInput settingsKey={'themeSidebarColor'} label={'Sidebar Background Color'} />
        <SettingsColorInput settingsKey={'themeSidebarTextColor'} label={'Sidebar Text Color'} />
        <SettingsColorInput settingsKey={'themeSidebarHoverColor'} label={'Sidebar Hovering Color'} />
        <SettingsColorInput settingsKey={'themeTopbarColor'} label={'Application Bar Color'} />
      </SettingsSection>

      <SettingsSection title="Note Items">
        <SettingsNumberInput
          settingsKey={'noteItemSaveDelay'}
          label={'Save-delay of notes, in milliseconds'}
          helperText="Determines the number of milliseconds that Yana waits after user input until the note is saved.
            Switching or closing the tab or app always auto-saves the note. If the user continues typing, the timer is reset"
        />
        {/*<SettingsNumberInput
          settingsKey={'noteItemMaximumSaveInterval'}
          label={"Maximal Save-delay of notes, in milliseconds"}
          helperText="Maximal delay after user input until a note is saved, even if the user continued typing after that amount of time."
        />*/}
      </SettingsSection>

      <SettingsSection title="Backups">
        <SettingsSwitchInput settingsKey={'autoBackupActive'} label={'Automatically backup workspaces'} />
        <SettingsSwitchInput settingsKey={'autoBackupIncludeMedia'} label={'Include media data in workspace backups'} />
        <SettingsNumberInput settingsKey={'autoBackupCount'} label={'Maximum number of automatic backups to keep'} />
        <SettingsNumberInput
          settingsKey={'autoBackupInterval'}
          label={'Backup Interval, in Minutes'}
          divideFactor={1000 * 60}
          step={1000 * 60}
          min={0}
        />
        <SettingsFilesystemPathInput settingsKey={'autoBackupLocation'} label={'Backup Location'} />
        <SettingsClickable
          title="Open Backup Location"
          icon="folder-open"
          subtitle="Open the folder where backups are stored in the native file explorer."
          onClick={() => remote.shell.openPath(settings.settings.autoBackupLocation)}
        />
      </SettingsSection>

      <SettingsSection title="Updates">
        <SettingsSwitchInput
          settingsKey={'autoUpdateAppActive'}
          label={'Automatically update Yana when a new version gets available'}
        />
        <SettingsSwitchInput
          settingsKey={'autoUpdateAppBackupActive'}
          label={'Automatically backup workspaces before updating'}
        />
      </SettingsSection>

      <SettingsSection title="Manage Workspaces">
        <SettingsClickable
          title="Manage Workspaces"
          icon={'chevron-right'}
          subtitle="Import, export, delete or create workspaces."
          onClick={() => mainContent.openInCurrentTab(PageIndex.ManageWorkspaces)}
        />
        <SettingsClickable
          title="Export current workspace"
          icon={'export'}
          subtitle="Export the workspace as a zip file that you can later import in this or a different instance of Yana."
          onClick={async () => {
            const workspace = app.currentWorkspace;
            const result = await remote.dialog.showSaveDialog({
              buttonLabel: 'Export',
              properties: ['createDirectory', 'showOverwriteConfirmation'],
              title: 'Choose a location to export your workspace to',
              defaultPath: workspace.name.toLowerCase().replace(/\s/g, '_') + '.zip',
            });
            if (result.filePath) {
              await AppDataExportService.exportTo(result.filePath, workspace, console.log);
              remote.shell.showItemInFolder(result.filePath);
            }
          }}
        />
      </SettingsSection>
    </div>
  );
};
