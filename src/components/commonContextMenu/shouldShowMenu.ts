import { ContextMenuParams } from 'electron';

export const shouldShowMenu = (params: ContextMenuParams) => {
  return (
    params.editFlags.canCopy
    || params.editFlags.canCut
    || params.editFlags.canDelete
    || params.editFlags.canPaste
    || params.misspelledWord
    || params.linkURL
  );
};