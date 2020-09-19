import Color from 'color';
import React, { useContext } from 'react';

export interface Theme {
  primaryColor: string;
  sidebarColor: string;
  sidebarHoverColor: string;
  sidebarTextColor: string;
  topBarColor: string;
}

const defaultPrimaryColor = '#2c3e50';

export const defaultTheme: Theme = {
  primaryColor: '#377cc3',
  sidebarColor: defaultPrimaryColor,
  sidebarHoverColor: Color(defaultPrimaryColor).lighten(.1).toString(),
  sidebarTextColor: Color(defaultPrimaryColor).lighten(2).mix(new Color('#444'), .3).toString(),
  topBarColor: Color(defaultPrimaryColor).darken(.1).toString(),
};

export const ThemeContext = React.createContext(defaultTheme);

export const useTheme = () => useContext(ThemeContext);