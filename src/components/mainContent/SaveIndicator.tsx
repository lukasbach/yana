import * as React from 'react';
import { Icon, IconName, Intent, Tag } from '@blueprintjs/core';
import { SaveIndicatorState } from './EditorContainer';
import { useEffect, useState } from 'react';
import { useSettings } from '../../appdata/AppDataProvider';

export const SaveIndicator: React.FC<{
  saveIndicator?: SaveIndicatorState;
}> = props => {
  const settings = useSettings();
  const [saveIndicator, setSaveIndicator] = useState<SaveIndicatorState>(SaveIndicatorState.Saved);
  useEffect(() => {
    if (props.saveIndicator === SaveIndicatorState.Saved && saveIndicator !== SaveIndicatorState.Saved) {
      setSaveIndicator(SaveIndicatorState.RecentlySaved);
      const timeout = setTimeout(() => setSaveIndicator(SaveIndicatorState.Saved), 1000);
      return () => clearTimeout(timeout);
    } else if (props.saveIndicator) {
      setSaveIndicator(props.saveIndicator);
    }
  }, [props.saveIndicator]);

  let saveIndicatorText: string = 'Unknown save state';
  let saveIndicatorIcon: IconName | undefined;
  let saveIndicatorIntent: Intent = 'none';

  switch (saveIndicator) {
    case SaveIndicatorState.Saved:
      saveIndicatorText = 'Unchanged';
      break;
    case SaveIndicatorState.Unsaved:
      saveIndicatorText = 'Changed';
      saveIndicatorIcon = 'edit';
      break;
    case SaveIndicatorState.Saving:
      saveIndicatorText = 'Saving...';
      saveIndicatorIcon = 'floppy-disk';
      saveIndicatorIntent = 'primary';
      break;
    case SaveIndicatorState.RecentlySaved:
      saveIndicatorText = 'Saved';
      saveIndicatorIcon = 'tick-circle';
      saveIndicatorIntent = 'success';
      break;
  }

  if (!settings.editorShowSaveIndicator) {
    return null;
  }

  return (
    <Tag
      children={saveIndicatorText}
      intent={saveIndicatorIntent}
      icon={<Icon icon={saveIndicatorIcon} iconSize={10} />}
      minimal
    />
  );
};
