import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsTextInput } from '../layout/SettingsTextInput';
import { SettingsSelectInput } from '../layout/SettingsSelectInput';
import { SideBarItemAction } from '../../../settings/types';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsNumberInput } from '../layout/SettingsNumberInput';
import { DetailedListItem } from '../../common/DetailedListItem';
import { SettingsClickable } from '../layout/SettingsClickable';
import { useMainContentContext } from '../../mainContent/context';
import { PageIndex } from '../../../PageIndex';
import { remote } from "electron";
import { AppDataExportService } from '../../../appdata/AppDataExportService';
import { Button } from '@blueprintjs/core';
import { useAppData } from '../../../appdata/AppDataProvider';
import { SettingsFilesystemPathInput } from '../layout/SettingsFilesystemPathInput';

const sidebarActions = [
  { value: SideBarItemAction.OpenInNewTab, label: 'Open in new Tab' },
  { value: SideBarItemAction.OpenInCurrentTab, label: 'Open in current Tab' },
  { value: SideBarItemAction.ToggleExpansion, label: 'Toggle in sidebar' },
];

export const GeneralSettings: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const app = useAppData();

  return (
    <div>
      <SettingsSection title="Sidebar">
        <SettingsSelectInput
          settingsKey={'sidebarNoteItemNameAction'}
          label={"Action when clicking on the name of a Note Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarNoteItemBackgroundAction'}
          label={"Action when clicking on the background of a Note Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarNoteItemMiddleClickAction'}
          label={"Action when middle-clicking on a Note Item"}
          options={sidebarActions}
        />

        <SettingsSelectInput
          settingsKey={'sidebarCollectionItemNameAction'}
          label={"Action when clicking on the name of a Collection Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarCollectionItemBackgroundAction'}
          label={"Action when clicking on the background of a Collection Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarCollectionItemMiddleClickAction'}
          label={"Action when middle-clicking on a Collection Item"}
          options={sidebarActions}
        />

        <SettingsSelectInput
          settingsKey={'sidebarMediaItemNameAction'}
          label={"Action when clicking on the name of a Media Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarMediaItemBackgroundAction'}
          label={"Action when clicking on the background of a Media Item"}
          options={sidebarActions}
        />
        <SettingsSelectInput
          settingsKey={'sidebarMediaItemMiddleClickAction'}
          label={"Action when middle-clicking on a Media Item"}
          options={sidebarActions}
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
          step={1000}
          min={0}
        />
        <SettingsFilesystemPathInput
          settingsKey={'autoBackupLocation'}
          label={"Backup Location"}
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
