import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSelectInput } from '../layout/SettingsSelectInput';
import { SideBarItemAction } from '../../../settings/types';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsNumberInput } from '../layout/SettingsNumberInput';
import { SettingsClickable } from '../layout/SettingsClickable';


const sidebarActions = [
  { value: SideBarItemAction.OpenInNewTab, label: 'Open in new Tab' },
  { value: SideBarItemAction.OpenInCurrentTab, label: 'Open in current Tab' },
  { value: SideBarItemAction.ToggleExpansion, label: 'Toggle in sidebar' },
];

export const SidebarSettings: React.FC<{}> = props => {
  return (
    <div>
      <SettingsSection title="Sidebar">
        <SettingsClickable
          title="General Sidebar Settings"
        />

        <SettingsNumberInput
          settingsKey={'sidebarNumberOfUntruncatedItems'}
          label="Number of childs shown by default"
          helperText="When an item in the sidebar has more than this many children, the rest will be truncated."
        />

        <SettingsNumberInput
          settingsKey={'sidebarOffsetPerLevel'}
          label="Offset per level"
          helperText="Number of pixels that every level should be offset in the sidebar."
        />

        <SettingsSwitchInput
          settingsKey={'sidebarShowStarredItems'}
          label="Show starred items in sidebar"
        />
        <SettingsNumberInput
          settingsKey={'sidebarShowStarredItemsCount'}
          label="Number of starred items shown"
          enabledTrigger={'sidebarShowStarredItems'}
          min={1}
          max={20}
        />

        <SettingsSwitchInput
          settingsKey={'sidebarShowRecentItems'}
          label="Show recently edited items in sidebar"
        />
        <SettingsNumberInput
          settingsKey={'sidebarShowRecentItemsCount'}
          label="Number of recent items shown"
          enabledTrigger={'sidebarShowRecentItems'}
          min={1}
          max={20}
        />
      </SettingsSection>

      <SettingsSection title="Action Customizations">

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

    </div>
  );
};
