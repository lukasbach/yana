import { remote } from 'electron';
import { ContextMenu, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { shouldShowMenu } from './shouldShowMenu';

export const registerCommonContextMenu = () => {
  remote.getCurrentWebContents().on('context-menu', (event, params) => {
    if (shouldShowMenu(params)) {
      ContextMenu.show(
        <Menu>
          {params.misspelledWord && (
            <>
              {params.dictionarySuggestions.length ? (
                params.dictionarySuggestions.map(sugg => (
                  <MenuItem
                    key={sugg}
                    text={sugg}
                    onClick={() => remote.getCurrentWebContents().replaceMisspelling(sugg)}
                  />
                ))
              ) : (
                <MenuItem text="No suggestions available" disabled />
              )}
              <MenuDivider />
              <MenuItem
                icon={'add'}
                onClick={() =>
                  remote.getCurrentWebContents().session.addWordToSpellCheckerDictionary(params.misspelledWord)
                }
                text={`Add to the dictionary`}
              />
              <MenuDivider />
            </>
          )}

          {params.linkURL && (
            <>
              <MenuItem
                onClick={() => remote.shell.openExternal(params.linkURL)}
                icon={'globe'}
                text={`Open URL in browser`}
              />
              <MenuItem
                onClick={() => remote.clipboard.writeText(params.linkURL)}
                icon={'duplicate'}
                text={`Copy URL to clipboard`}
              />
              <MenuDivider />
            </>
          )}

          {(params.editFlags.canCopy ||
            params.editFlags.canCut ||
            params.editFlags.canDelete ||
            params.editFlags.canPaste ||
            params.editFlags.canRedo ||
            params.editFlags.canUndo ||
            params.editFlags.canSelectAll) && (
            <>
              {params.editFlags.canCopy && (
                <MenuItem onClick={() => document.execCommand('copy')} icon={'duplicate'} text={`Copy`} />
              )}
              {params.editFlags.canCopy && (
                <MenuItem
                  onClick={() =>
                    remote.shell.openExternal(
                      `https://www.google.com/search?q=${params.selectionText.split(' ').join('+')}`
                    )
                  }
                  icon={'search-text'}
                  text={`Search for on Google`}
                />
              )}
              {params.editFlags.canCut && (
                <MenuItem onClick={() => document.execCommand('cut')} icon={'cut'} text={`Cut`} />
              )}
              {params.editFlags.canPaste && (
                <MenuItem onClick={() => document.execCommand('paste')} icon={'clipboard'} text={`Paste`} />
              )}
              {params.editFlags.canSelectAll && (
                <MenuItem onClick={() => document.execCommand('selectAll')} icon={'select'} text={`Select All`} />
              )}
              {params.editFlags.canDelete && (
                <MenuItem onClick={() => document.execCommand('delete')} icon={'arrow-left'} text={`Delete`} />
              )}
              {params.editFlags.canUndo && (
                <MenuItem onClick={() => document.execCommand('undo')} icon={'undo'} text={`Undo`} />
              )}
              {params.editFlags.canRedo && (
                <MenuItem onClick={() => document.execCommand('redo')} icon={'redo'} text={`Redo`} />
              )}
            </>
          )}
        </Menu>,
        { top: params.y, left: params.x }
      );
    }
  });
};
