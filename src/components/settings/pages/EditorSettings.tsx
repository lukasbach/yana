import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSelectInput } from '../layout/SettingsSelectInput';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsNumberInput } from '../layout/SettingsNumberInput';
import { SettingsClickable } from '../layout/SettingsClickable';
import { remote } from 'electron';

export const EditorSettings: React.FC<{}> = props => {
  return (
    <div>
      <SettingsSection title="General">
        <SettingsSwitchInput
          settingsKey={'editorShowSaveIndicator'}
          label={"Show save indicator"}
          helperText={(
            'When you change the content of a note, the indicator shows if the changes were changed or are still pending. ' +
            'Saves are always automatic, so this feature is mostly for debugging.'
          )}
        />
      </SettingsSection>

      <SettingsSection title="Notes Editor">
        <SettingsSwitchInput
          settingsKey={'editorAtlassianAdvancedTables'}
          label={"Advanced tables"}
        />
        <SettingsClickable
          title="More about the editor"
          subtitle="Yana's notes editor is powered by Atlassian's editor core."
          icon={'help'}
          onClick={() => {
            remote.shell.openExternal('https://atlaskit.atlassian.com/packages/editor/editor-core')
          }}
        />
      </SettingsSection>

      <SettingsSection title="Code Snippet Editor">
        <SettingsSelectInput
          settingsKey={'editorMonacoTheme'}
          label={"Theme"}
          options={[
            { value: 'vs', label: 'Light Theme' },
            { value: 'vs-dark', label: 'Dark Theme' },
            { value: 'hc-black', label: 'High Contrast' },
          ]}
        />
        <SettingsSwitchInput
          settingsKey={'editorMonacoMinimap'}
          label={"Minimap"}
        />
        <SettingsSwitchInput
          settingsKey={'editorMonacoRenderControlChars'}
          label={"Render Control Characters"}
        />
        <SettingsSelectInput
          settingsKey={'editorMonacoRenderWhitespace'}
          label={"Render Whitespace"}
          options={[
            { value: 'none', label: 'None' },
            { value: 'boundary', label: 'Boundary' },
            { value: 'selection', label: 'Selection' },
            { value: 'trailing', label: 'Trailing' },
            { value: 'all', label: 'All' },
          ]}
        />
        <SettingsSelectInput
          settingsKey={'editorMonacoWordWrap'}
          label={"Word Wrap"}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'On' },
            { value: 'wordWrapColumn', label: 'WordWrapColumn' },
            { value: 'bounded', label: 'Bounded' },
          ]}
        />
        <SettingsNumberInput
          settingsKey={'editorMonacoTabSize'}
          label={"Tab Size"}
        />
        <SettingsNumberInput
          settingsKey={'editorMonacoRuler'}
          label={"Ruler"}
          helperText={"Setting to zero disables the ruler."}
        />
        <SettingsClickable
          title="More about the editor"
          subtitle="Yana's code snippet editor is powered by Microsoft's Monaco editor."
          icon={'help'}
          onClick={() => {
            remote.shell.openExternal('https://microsoft.github.io/monaco-editor/index.html')
          }}
        />
      </SettingsSection>
    </div>
  );
};
