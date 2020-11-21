import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsNumberInput } from '../layout/SettingsNumberInput';
import { SettingsClickable } from '../layout/SettingsClickable';
import { useMainContentContext } from '../../mainContent/context';
import { PageIndex } from '../../../PageIndex';
import { remote } from "electron";
import { AppDataExportService } from '../../../appdata/AppDataExportService';
import { useAppData, useSettings } from '../../../appdata/AppDataProvider';
import { SettingsFilesystemPathInput } from '../layout/SettingsFilesystemPathInput';
import { SettingsColorInput } from '../layout/SettingsColorInput';
import { useSettingsPageContext } from '../SettingsContext';
import { defaultTheme } from '../../../common/theming';

export const GeneralSettings: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const app = useAppData();
  const settings = useSettingsPageContext();

  return (
    <div>
      <SettingsSection title="General Settings">
        <SettingsNumberInput
          settingsKey={'zoomFactor'}
          label="Zoom Factor"
          step={.1}
          min={.4}
          max={5}
        />
      </SettingsSection>

      <SettingsSection title="Note Items">
        <SettingsNumberInput
          settingsKey={'noteItemSaveDelay'}
          label={"Save-delay of notes, in milliseconds"}
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
        <SettingsSwitchInput
          settingsKey={'autoBackupActive'}
          label={"Automatically backup workspaces"}
        />
        <SettingsSwitchInput
          settingsKey={'autoBackupIncludeMedia'}
          label={"Include media data in workspace backups"}
        />
        <SettingsNumberInput
          settingsKey={'autoBackupCount'}
          label={"Maximum number of automatic backups to keep"}
        />
        <SettingsNumberInput
          settingsKey={'autoBackupInterval'}
          label={"Backup Interval, in Minutes"}
          divideFactor={1000 * 60}
          step={1000 * 60}
          min={0}
        />
        <SettingsFilesystemPathInput
          settingsKey={'autoBackupLocation'}
          label={"Backup Location"}
        />
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
          label={"Automatically update Yana when a new version gets available"}
        />
        <SettingsSwitchInput
          settingsKey={'autoUpdateAppBackupActive'}
          label={"Automatically backup workspaces before updating"}
        />
      </SettingsSection>

      <SettingsSection title="Personalization">
        <SettingsColorInput
          settingsKey={'themePrimaryColor'}
          label={"Primary Color"}
        />
        <SettingsColorInput
          settingsKey={'themeSidebarColor'}
          label={"Sidebar Background Color"}
        />
        <SettingsColorInput
          settingsKey={'themeSidebarTextColor'}
          label={"Sidebar Text Color"}
        />
        <SettingsColorInput
          settingsKey={'themeSidebarHoverColor'}
          label={"Sidebar Hovering Color"}
        />
        <SettingsColorInput
          settingsKey={'themeTopbarColor'}
          label={"Application Bar Color"}
        />
        <SettingsClickable
          title="Reset to default Theme"
          icon={'reset'}
          onClick={() => {
            settings.changeSettings({
              themePrimaryColor: defaultTheme.primaryColor,
              themeSidebarColor: defaultTheme.sidebarColor,
              themeSidebarTextColor: defaultTheme.sidebarTextColor,
              themeSidebarHoverColor: defaultTheme.sidebarHoverColor,
              themeTopbarColor: defaultTheme.topBarColor,
            })
          }}
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
              await AppDataExportService.exportTo(result.filePath, workspace, console.log)
              remote.shell.showItemInFolder(result.filePath);
            }
          }}
        />
      </SettingsSection>
    </div>
  );
};
