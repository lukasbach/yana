import * as React from 'react';
import { NoteDataItem } from '../../types';
import { isNoteItem } from '../../utils';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { Button, Menu, MenuItem, Popover } from '@blueprintjs/core';
import { useState } from 'react';
import { remote } from 'electron';

export const EditorExportButton: React.FC<{
  dataItem: NoteDataItem<any>,
  content: any
}> = props => {
  if (!isNoteItem(props.dataItem)) {
    return null;
  }

  const editor = EditorRegistry.Instance.getEditorWithId(props.dataItem.noteType);

  if (!editor?.exportOptions?.length) {
    return null;
  }

  return (
    <Popover
      content={(
        <Menu>
          { editor.exportOptions.map(exportOption => (
            <MenuItem
              key={exportOption.name}
              text={exportOption.name}
              onClick={async () => {
                const destResult = await remote.dialog.showOpenDialog({
                  buttonLabel: 'Choose',
                  properties: ['createDirectory', 'promptToCreate'],
                  title: 'Choose a target for exporting the note',
                });

                if (destResult.canceled || !destResult.filePaths[0]) return;

                await exportOption.export(props.content, destResult.filePaths[0]);
              }}
            />
          )) }
        </Menu>
      )}
    >
      <Button outlined icon={'export'}>
        Content
      </Button>
    </Popover>
  );
};
