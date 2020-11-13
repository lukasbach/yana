import * as React from 'react';
import { MediaItem } from '../../types';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import cxs from 'cxs';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useEffect, useState } from 'react';
import { Button, Popover } from '@blueprintjs/core';
import { MediaItemContextMenu } from '../menus/MediaItemContextMenu';
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { useMainContentContext } from './context';
import { useOverlaySearch } from '../overlaySearch/OverlaySearchProvider';

const styles = {
  mainContainer: cxs({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  })
}

export const MediaView: React.FC<{
  dataItem: MediaItem,
}> = ({ dataItem}) => {
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  const overlaySearch = useOverlaySearch();
  const [previewPath, setPreviewPath] = useState<undefined | string>();

  useEffect(() => {
    dataInterface.loadMediaItemContentAsPath(dataItem.id).then(setPreviewPath);
  }, [dataItem.id]);

  return (
    <PageContainer
      header={(
        <PageHeader
          title={dataItem.name}
          icon={'media'}
          titleSubtext={dataItem.referencePath || previewPath}
          rightContent={(
            <Popover
              interactionKind={'click'}
              content={(
                <MediaItemContextMenu
                  item={dataItem}
                  renderer={Bp3MenuRenderer}
                  mainContent={mainContent}
                  dataInterface={dataInterface}
                  overlaySearch={overlaySearch}
                />
              )}
            >
              <Button intent="primary" icon="edit" outlined>
                Modify
              </Button>
            </Popover>
          )}
        />
      )}
    >
      <div className={styles.mainContainer}>
        { (previewPath || dataItem.referencePath) && ['svg', 'png', 'jpg', 'jpeg', 'gif'].includes(dataItem.extension) && (
          <div>
            <img src={previewPath || dataItem.referencePath} alt={"Media preview"} />
          </div>
        ) }
      </div>
    </PageContainer>
  );
};
