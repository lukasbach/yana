import * as React from 'react';
import { useState } from 'react';
import { InputGroup } from '@blueprintjs/core';
import { SearchBarModifiers } from '../../searchbar/SearchBarModifiers';
import { useSearchBar } from '../../searchbar/SearchBar';

export const SearchInput: React.FC = props => {
  const { setSearchValue, searchQuery, searchValue } = useSearchBar();
  const [isActive, setIsActive] = useState(false);


  return (
    <>
      <InputGroup
        type="search"
        leftIcon="search"
        value={searchValue}
        onClick={() => setIsActive(true)}
        onChange={(e: any) => setSearchValue(e.target.value)}
        large
      />
      <div style={{ display: isActive ? 'block' : 'none', marginTop: '8px' }}>
        <SearchBarModifiers buttonProps={{ minimal: true, small: true }} />
      </div>
    </>
  );
};
