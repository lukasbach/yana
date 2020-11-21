import { SpotlightScenario } from '../SpotlightScenario';
import { SpotlightScenarioId } from '../SpotlightScenarioId';
import { Spotlight } from '@atlaskit/onboarding';
import React from 'react';
import { PageIndex } from '../../../PageIndex';

export const SidebarScenario: SpotlightScenario = {
  id: SpotlightScenarioId.SidebarScenario,
  steps: [
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom center"
        heading="Welcome to Yana!"
        target="sidebar-workplace-selection"
        key="sidebar-workplace-selection"
      >
        This quick introduction shows you the basics of using
        Yana. You can skip it if you are already familiar
        with Yana or if you want to experiment by yourself.
        The introduction can be restarted from the settings.
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom center"
        heading="Workspaces"
        target="sidebar-workplace-selection"
        key="sidebar-workplace-selection"
      >
        <p>
          In Yana you can have more than one workspace. Each workspace is stored on a location
          on your hard drive, and contains as many notes as you want.
        </p>
        <p>
          Click on this button to choose a different workspace, or create a new workspace.
        </p>
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom center"
        heading="Settings"
        target="sidebar-settings"
        key="sidebar-settings"
      >
        Click the cog icon to open Yana's settings...
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom center"
        heading="Draft items"
        target="sidebar-new-draft"
        key="sidebar-new-draft"
      >
        or the plus icon to create a new draft item.
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="right middle"
        heading="Draft items"
        target={`sidebar-navigationtree-${PageIndex.DraftItems}`}
        key={`sidebar-navigationtree-${PageIndex.DraftItems}`}
      >
        Each draft you create is available from this view. Click to open
        a list of all your draft items. You can always right click any
        note and move it to a different location.
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="right middle"
        heading="Trash"
        target={`sidebar-navigationtree-${PageIndex.Trash}`}
        key={`sidebar-navigationtree-${PageIndex.Trash}`}
      >
        Items you've removed can be restored or deleted for ever from the trash can.
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="right middle"
        heading="Your notes"
        target="sidebar-items"
        key="sidebar-items"
      >
        <p>
          You can structure your notes in a nested tree. Click on folders to toggle them, or
          on the names to open them directly. You can always drag and drop items to reorder them
          or move them to a different location.
        </p>
        <p>
          Right click an item to bring up more options for that item.
        </p>
        <p>
          <b>To create a new note or folder</b>, click on the plus icon that appears when hovering over{' '}
          <i>My Collections</i>, or right-click any folder to create new child items.
        </p>
        <p>
          You can also click on the item with a middle click to open the item in a new tab.
        </p>
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="right middle"
        heading="Sidebar"
        target="sidebar"
        key="sidebar"
      >
        You can change the width of the sidebar by dragging its right border, or minimize
        it by clicking on the arrow on the bottom.
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom left"
        heading="Tabs"
        target="topbar"
        key="topbar"
      >
        <p>
          Notes that you open are listed in individual tabs. You can reorder tabs by dragging them.
        </p>
      </Spotlight>
    ),
    ({ defaultActions }) => (
      <Spotlight
        actions={defaultActions}
        dialogPlacement="bottom left"
        heading="That's all for now!"
        target="topbar"
        key="topbar"
      >
        <p>
          Have fun with Yana!
        </p>
      </Spotlight>
    ),
  ]
}