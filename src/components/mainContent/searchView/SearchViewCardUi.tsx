import * as React from 'react';
import { Classes, Icon, IconName, NonIdealState } from '@blueprintjs/core';
import cxs from 'cxs';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { CSSProperties, DOMAttributes } from 'react';

const styles = {
  itemCard: cxs({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 3px 1px #bbb',
    margin: '8px',
    height: `${searchViewCellDimensions.cellHeight - 8 * 2}px`,
    transition: '.2s all ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0px 6px 10px 2px #bbb',
    }
  }),
  cardHeader: cxs({
    padding: '8px 16px 6px 16px',
    '> h4': {
      margin: 0,
      fontSize: '14px',
      ' .bp3-icon': {
        marginRight: '12px'
      }
    }
  }),
  cardMiddle: cxs({
    padding: '16px',
    backgroundColor: '#eee',
    backgroundPosition: 'center',
    flexGrow: 1,
    overflow: 'hidden',
  }),
  cardFooter: cxs({
    padding: '6px 16px 6px 16px',
    textAlign: 'right',
    fontStyle: 'italic',
    color: '#444',
    fontSize: '11px'
  }),
}

export interface SearchViewCardUiProps {
  key: string,
  containerStyle?: CSSProperties,
  containerProps?: DOMAttributes<any>,
  additionalLeftMargin?: number,
  onClick?: () => void,
  interactive?: boolean,
  header: string,
  icon?: IconName,
  iconColor?: string,
  thumbnail?: string,
  preview?: JSX.Element,
  isCollection?: boolean,
  footerText?: string,
}

export const SearchViewCardUi: React.FC<SearchViewCardUiProps> = props => {
  return (
    <div
      key={props.key}
      style={{
        ...(props.containerStyle ?? {}),
        transform: `translateX(${props.additionalLeftMargin ?? 0}px)`
      }}
      onClick={props.onClick}
      {...props.containerProps}
    >
      <div className={styles.itemCard}>
        <div className={styles.cardHeader}>
          <h4 className={Classes.TEXT_OVERFLOW_ELLIPSIS}>
            <Icon icon={props.icon} color={props.iconColor} />
            { props.header }
          </h4>
        </div>
        <div
          className={styles.cardMiddle}
          style={{ backgroundImage: props.thumbnail && `url("file:///${props.thumbnail.replace(/\\/g, '/')}")` }}
        >
          { props.isCollection && !props.preview && (
            <NonIdealState icon={'folder-open'} />
          ) }
          { !props.isCollection && !props.preview && !props.thumbnail && (
            <NonIdealState icon={'document'} />
          ) }
          { props.preview }
        </div>
        <div className={styles.cardFooter}>
          { props.footerText }
        </div>
      </div>
    </div>
  );
};
