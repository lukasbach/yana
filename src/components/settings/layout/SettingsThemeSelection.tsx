import * as React from 'react';
import { themes } from '../../../themes';
import { ThemeButton } from './ThemeButton';
import { SettingsSection } from './SettingsSection';
import { Theme } from '../../../common/theming';
import cxs from 'cxs';

const container = cxs({
  display: 'flex',
  flexWrap: 'wrap'
})

export const SettingsThemeSelection: React.FC<{
  currentTheme: Theme,
  onChangeTheme: (theme: Theme) => void,
}> = ({ currentTheme, onChangeTheme }) => {

  return (
    <div className={container}>
      { themes.map(theme => (
        <ThemeButton
          theme={theme}
          active={(
            currentTheme.topBarColor === theme.topBarColor &&
            currentTheme.sidebarColor === theme.sidebarColor &&
            currentTheme.sidebarTextColor === theme.sidebarTextColor &&
            currentTheme.sidebarHoverColor === theme.sidebarHoverColor &&
            currentTheme.primaryColor === theme.primaryColor
          )}
          onClick={() => onChangeTheme(theme)}
        />
      )) }
    </div>
  );
};
