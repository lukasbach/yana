import * as React from 'react';
import { useState } from 'react';
import { useAsyncEffect } from '../../utils';
import { useAppData } from '../../appdata/AppDataProvider';
import { Classes, Dialog, Toast, Toaster } from '@blueprintjs/core';
import packageJson from '../../../package.json';
import { LogService } from '../../common/LogService';
import { useTelemetry } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';

const minTimeBetweenReshow = 1000 * 60 * 60 * 24 * 3; // 3 days
const maxShowCount = 3;

const logger = LogService.getLogger('AppNotifications');

interface AppNotification {
  id: string;
  appVersions?: string[];
  apps?: string[];
  after?: string;
  before?: string;
  title: string;
  summary: string;
  date: string;
  chance?: number;
  showCount?: number;
  author: {
    name: string;
    url: string;
    avatar: string;
  };
}

export const AppNotifications: React.FC<{}> = props => {
  const { settings, saveSettings } = useAppData();
  const [promotedNotification, setPromotedNotification] = useState<AppNotification>();
  const [shownNotification, setShownNotification] = useState<AppNotification>();
  const [notificationHtml, setNotificationHtml] = useState('');
  const telemetry = useTelemetry();

  const sawNotification = async (id: string, dismissed: boolean) => {
    const oldNotificationSeenCount = settings.notifications.find(n => n.id === id)?.seenCount ?? 0;
    await saveSettings({
      ...settings,
      notifications: [
        ...settings.notifications.filter(n => n.id !== id),
        {
          id,
          dismissed,
          seenDate: Date.now(),
          seenCount: oldNotificationSeenCount + 1,
        },
      ],
    });
  };

  useAsyncEffect(async () => {
    const notifications: AppNotification[] = await (
      await fetch(`https://lukasbach.github.io/app-notifications/apps/yana.tiny.json`)
    ).json();
    logger.log(`${notifications.length} notifications found`, [], { notifications });

    for (const notification of notifications) {
      const registeredNotification = settings.notifications.find(not => not.id === notification.id);
      if (
        !registeredNotification ||
        (!registeredNotification.dismissed && registeredNotification.seenDate < Date.now() - minTimeBetweenReshow)
      ) {
        if ((registeredNotification?.seenCount ?? 0) >= (notification.showCount ?? maxShowCount)) {
          logger.log(`Notification ${notification.id} skipped due to maxShowCount`, [], { notification });
          continue;
        }

        if (notification.appVersions && !notification.appVersions.includes(packageJson.version)) {
          logger.log(`Notification ${notification.id} skipped due to app version`, [], { notification });
          continue;
        }
        if (notification.apps && !notification.apps.includes('yana')) {
          logger.log(`Notification ${notification.id} skipped due to app name`, [], { notification });
          continue;
        }
        if (notification.after && !(new Date(notification.after).getTime() < Date.now())) {
          logger.log(`Notification ${notification.id} skipped due to after`, [], { notification });
          continue;
        }
        if (notification.before && !(new Date(notification.before).getTime() > Date.now())) {
          logger.log(`Notification ${notification.id} skipped due to before`, [], { notification });
          continue;
        }
        if (notification.chance !== undefined && !(Math.random() < notification.chance)) {
          logger.log(`Notification ${notification.id} skipped due to chance`, [], { notification });
          continue;
        }

        await sawNotification(notification.id, false);
        setPromotedNotification(notification);
        return;
      }
    }
  }, []);

  return (
    <>
      <Dialog
        isOpen={!!shownNotification}
        icon={'info-sign'}
        onClose={() => setShownNotification(undefined)}
        title={shownNotification?.title}
      >
        <div className={Classes.DIALOG_BODY} dangerouslySetInnerHTML={{ __html: notificationHtml }} />
      </Dialog>
      <Toaster autoFocus={false} canEscapeKeyClear={true} position={'top-right'}>
        {promotedNotification && (
          <Toast
            intent={'primary'}
            timeout={60000}
            message={promotedNotification.title}
            action={{
              text: 'Details',
              onClick: () => {
                sawNotification(promotedNotification.id, true);
                telemetry.trackEvent(...TelemetryEvents.AppNotifications.viewed);
                telemetry.trackEvent(
                  TelemetryEvents.AppNotifications.viewed[0],
                  TelemetryEvents.AppNotifications.viewed[1] + '_' + promotedNotification?.id
                );
                setShownNotification(promotedNotification);
                fetch(`https://lukasbach.github.io/app-notifications/content/${promotedNotification.id}.html`)
                  .then(r => r.text())
                  .then(html => {
                    setNotificationHtml(html);
                  });
              },
            }}
            onDismiss={didTimeoutExpire => {
              if (!didTimeoutExpire) {
                telemetry.trackEvent(...TelemetryEvents.AppNotifications.dismissed);
                telemetry.trackEvent(
                  TelemetryEvents.AppNotifications.dismissed[0],
                  TelemetryEvents.AppNotifications.dismissed[1] + '_' + promotedNotification?.id
                );
              } else {
                telemetry.trackEvent(
                  TelemetryEvents.AppNotifications.timedOut[0],
                  TelemetryEvents.AppNotifications.timedOut[1] + '_' + promotedNotification?.id
                );
                telemetry.trackEvent(...TelemetryEvents.AppNotifications.timedOut);
              }
              setPromotedNotification(undefined);
            }}
          />
        )}
      </Toaster>
    </>
  );
};
