import * as React from 'react';
import { OverlaySearch } from './OverlaySearch';
import { DataItem, SearchQuery } from '../../types';
import { useContext, useRef, useState } from 'react';

export interface OverlaySearchParameters {
  selectMultiple?: boolean;
  hiddenSearch?: SearchQuery;
  buttonText?: string;
}

export interface OverlaySearchContextValue {
  performSearch: (params: OverlaySearchParameters) => Promise<DataItem[] | undefined>;
}

const OverlaySearchContext = React.createContext<OverlaySearchContextValue>(null as any);

export const useOverlaySearch = () => useContext(OverlaySearchContext);

export const OverlaySearchProvider: React.FC<{}> = props => {
  const [params, setParams] = useState<undefined | OverlaySearchParameters>();
  const handler = useRef<undefined | ((items: DataItem[] | undefined) => void)>(undefined);

  return (
    <OverlaySearchContext.Provider value={{
      performSearch: (p) => {
        return new Promise(res => {
          handler.current = items => {
            setParams(undefined);
            handler.current = undefined;
            res(items);
          }
          setParams(p);
        });
      }
    }}>
      { props.children }
      { params && handler.current && (
        <OverlaySearch
          params={params}
          handler={handler.current}
        />
      ) }
    </OverlaySearchContext.Provider>
  );
};
