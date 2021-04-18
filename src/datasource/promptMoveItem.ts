import { DataItem, DataItemKind } from '../types';
import { TelemetryService } from '../components/telemetry/TelemetryProvider';
import { TelemetryEvents } from '../components/telemetry/TelemetryEvents';
import { InternalTag } from './InternalTag';
import { DataInterface } from './DataInterface';
import { OverlaySearchContextValue } from '../components/overlaySearch/OverlaySearchProvider';

export const promptMoveItem = async (
  dataInterface: DataInterface,
  overlaySearch: OverlaySearchContextValue,
  item: DataItem
) => {
  const parent = (await dataInterface.getParentsOf(item.id))[0];

  const target = await overlaySearch.performSearch({
    selectMultiple: false,
    hiddenSearch: { kind: DataItemKind.Collection },
  });

  if (parent) {
    if (target) {
      await dataInterface.moveItem(item.id, parent.id, target[0].id, 0);
      TelemetryService?.trackEvent(...TelemetryEvents.Items.move);
    }
  } else if (target) {
    await dataInterface.changeItem(target[0].id, old => ({ childIds: [...old.childIds, item.id] }));

    if (item.tags.includes(InternalTag.Trash) || item.tags.includes(InternalTag.Draft)) {
      await dataInterface.changeItem(item.id, ({ tags }) => ({
        tags: tags.filter(tag => tag !== InternalTag.Trash && tag !== InternalTag.Draft),
      }));
    }

    TelemetryService?.trackEvent(...TelemetryEvents.Items.move);
  }
};
