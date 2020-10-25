import * as React from 'react';
import { DetailedListItem } from '../../common/DetailedListItem';
import { IconName } from '@blueprintjs/core';
import cxs from 'cxs';

const style = cxs({
  margin: '0 -24px 0 -24px'
})

export const SettingsClickable: React.FC<{
  icon?: IconName,
  title: string,
  subtitle?: string,
  rightText?: string,
  actionButtons?: React.ReactNode,
  onClick?: () => void,
}> = props => {
  return (
    <div className={style}>
      <DetailedListItem {...props} />
    </div>
  );
};
