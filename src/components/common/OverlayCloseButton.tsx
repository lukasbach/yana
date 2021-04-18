import * as React from 'react';
import cxs from 'cxs';
import { Icon } from '@blueprintjs/core';

const btnStyles = cxs({
  padding: '16px',
  borderRadius: '1000px',
  backgroundColor: 'transparent',
  border: 0,
  cursor: 'pointer',
  WebkitAppRegion: 'no-drag',
  ':hover': {
    backgroundColor: '#eee',
  },
  ':active': {
    backgroundColor: '#d2d2d2',
  },
});

const btnStylesDarkbg = cxs({
  padding: '16px',
  borderRadius: '1000px',
  backgroundColor: 'transparent',
  border: 0,
  cursor: 'pointer',
  WebkitAppRegion: 'no-drag',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, .2)',
  },
  ':active': {
    backgroundColor: 'rgba(255, 255, 255, .3)',
  },
});

export const OverlayCloseButton: React.FC<{
  onClose: () => void;
  darkBackground?: boolean;
}> = props => {
  return (
    <button onClick={props.onClose} className={props.darkBackground ? btnStylesDarkbg : btnStyles}>
      <Icon icon={'cross'} iconSize={32} color={props.darkBackground ? '#fff' : '#000'} />
    </button>
  );
};
