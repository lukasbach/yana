import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { useState } from 'react';
import { useTheme } from '../../common/theming';
import { Icon } from '@blueprintjs/core';
import { useSearchBar } from '../searchbar/SearchBar';

const styles = {
  container: cxs({
    height: '60px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '4px solid transparent',
    transition: '.2s all ease',
    display: 'flex',
    '> .bp3-icon': {
      margin: '9px 9px 9px 14px',
      transition: '.2s color ease',
      // color: 'black'
    }
  }),
  containerFocus: cxs({

  }),
  input: cxs({
    height: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    flexGrow: 1,
    padding: '0 32px 0 4px',
    fontSize: '20px',
  }),
}

export const SearchInput: React.FC<{
}> = props => {
  const [focus, setFocus] = useState(false);
  const theme = useTheme();
  const search = useSearchBar();

  return (
    <div
      className={cx(
        styles.container,
        focus && styles.containerFocus,
        focus && cxs({
          borderColor: theme.primaryColor
        })
      )}
    >
      <Icon icon={'search'} iconSize={32} color={focus ? theme.primaryColor : 'black'} />
      <input
        className={styles.input}
        type="text"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        value={search.searchValue}
        onChange={(e: any) => search.setSearchValue(e.target.value)}
        ref={r => r?.focus()}
      />
    </div>
  );
};
