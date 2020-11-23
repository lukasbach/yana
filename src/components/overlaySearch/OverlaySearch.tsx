import * as React from 'react';
import cxs from 'cxs';
import { Button, Overlay } from '@blueprintjs/core';
import { OverlayCloseButton } from '../common/OverlayCloseButton';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { SearchBar } from '../searchbar/SearchBar';
import { SearchBarModifiers } from '../searchbar/SearchBarModifiers';
import { useState } from 'react';
import { DataItem, SearchQuery } from '../../types';
import { SelectedItems } from './SelectedItems';
import { SeachItemsContainer } from './SeachItemsContainer';
import { OverlaySearchParameters } from './OverlaySearchProvider';
import { SortingOptions } from './SortingOptions';
import { useScreenView } from '../telemetry/useScreenView';

const styles = {
  overlayContainer: cxs({
    '> .bp3-overlay-content': {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      color: 'white',
    },
    ' ::-webkit-scrollbar': {
      width: '8px',
      padding: '4px'
    },
    ' ::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    ' ::-webkit-scrollbar-thumb': {
      background: 'rgba(255,255,255, .4)',
      borderRadius: '999px',
    },
    ' ::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255,255,255, .6)',
    },
  }),
  container: cxs({
    position: 'fixed',
    top: '10%',
    left: '20%',
    right: '20%',
    bottom: '10%',
    display: 'flex',
    flexDirection: 'column',
    '@media screen and (max-width: 1200px)': {
      top: '18%',
      left: '5%',
      right: '5%',
      bottom: '2%',
    }
  }),
  searchBarContainer: cxs({
    height: '80px'
  }),
  mainContainer: cxs({
    flexGrow: 1,
    display: 'flex',
  }),
  resultContainer: cxs({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  }),
  rightContainer: cxs({
    width: '240px',
    marginLeft: '20px',
  }),
  rightContainerSection: cxs({
    display: 'flex',
    flexDirection: 'column',
  }),
  closeContainer: cxs({
    position: 'fixed',
    top: '40px',
    right: '40px'
  }),
  backdrop: cxs({
    backgroundColor: 'rgba(0, 0, 0, .7) !important',
  }),
}

export const OverlaySearch: React.FC<{
  params: OverlaySearchParameters,
  handler: (items: DataItem[] | undefined) => void,
}> = props => {
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [hiddenSearch, setHiddenSearch] = useState<SearchQuery>(props.params.hiddenSearch || {});
  useScreenView('overlay-search');

  return (
    <Overlay
      autoFocus={true}
      enforceFocus={true}
      usePortal={true}
      canOutsideClickClose={true}
      canEscapeKeyClose={true}
      hasBackdrop={true}
      backdropClassName={styles.backdrop}
      isOpen={true}
      className={styles.overlayContainer}
      onClose={() => props.handler(undefined)}
    >
      <div>
        <SearchBar>
          <div className={styles.closeContainer}>
            <OverlayCloseButton onClose={() => props.handler(undefined)} darkBackground={true} />
          </div>
          <div className={styles.container}>
            <div className={styles.searchBarContainer}>
              <SearchInput />
            </div>
            <div className={styles.mainContainer}>
              <div className={styles.resultContainer}>
                <SeachItemsContainer>
                  <SelectedItems
                    items={selectedItems}
                    onClickItem={item => setSelectedItems(items => items.filter(i => i.id !== item.id))}
                  />
                </SeachItemsContainer>
                <SeachItemsContainer grow>
                  <SearchResults
                    hiddenSearch={hiddenSearch}
                    hideItemIds={selectedItems.map(item => item.id)}
                    onClickItem={props.params.selectMultiple ? (
                      item => setSelectedItems(items => [...items, item])
                    ) : (
                      item => props.handler([item])
                    )}
                  />
                </SeachItemsContainer>
              </div>
              <div className={styles.rightContainer}>
                <div className={styles.rightContainerSection + ' ' + 'bp3-dark'}>
                  <SearchBarModifiers buttonProps={{ minimal: true }} />
                  <div>
                    { props.params.selectMultiple && (
                      <Button
                        outlined large
                        icon={'chevron-right'}
                        intent={'primary'}
                        onClick={() => props.handler(selectedItems)}
                      >
                        { props.params.buttonText || 'Select' }
                      </Button>
                    ) }
                  </div>
                  <SortingOptions searchQuery={hiddenSearch} onChange={setHiddenSearch} />
                </div>
              </div>
            </div>
          </div>
        </SearchBar>
      </div>
    </Overlay>
  );
};