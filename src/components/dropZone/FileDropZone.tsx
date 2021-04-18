import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import cxs from 'cxs';
import { useMainContentContext } from '../mainContent/context';

const styles = {
  container: cxs({
    position: 'fixed',
    top: '20px',
    right: '20px',
    left: '20px',
    bottom: '20px',
    backgroundColor: 'rgba(0, 0, 0, .4)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
  }),
};

export const FileDropZone: React.FC<{
  onDropFiles: (files: File[]) => void;
}> = props => {
  const [isDragging, setIsDragging] = useState(false);
  const mainContent = useMainContentContext();

  useEffect(() => {
    const onDrag = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const onDragExit = (e: Event) => setIsDragging(false);
    const onDragLeave = (e: DragEvent) => e.x === 0 && e.y === 0 && setIsDragging(false);
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      e.dataTransfer?.files.length && props.onDropFiles([...(e.dataTransfer?.files || [])]);
    };

    document.body.addEventListener('drop', onDrop, false);
    document.body.addEventListener('dragexit', onDragExit, false);
    document.body.addEventListener('dragleave', onDragLeave, false);
    document.body.addEventListener('dragenter', onDrag, false);
    document.body.addEventListener('dragover', onDrag, false);

    return () => {
      document.body.removeEventListener('drop', onDrop, false);
      document.body.removeEventListener('dragexit', onDragExit, false);
      document.body.removeEventListener('dragleave', onDragLeave, false);
      document.body.removeEventListener('dragenter', onDrag, false);
      document.body.removeEventListener('dragover', onDrag, false);
    };
  }, []);

  return ReactDOM.createPortal(
    isDragging && (
      <div className={styles.container}>Drop files to add to {mainContent.openTab?.dataItem?.name || 'Yana'}</div>
    ),
    document.body
  );
};
