import * as React from 'react';
import { PageContainer } from '../../common/PageContainer';
import { PageHeader } from '../../common/PageHeader';
import { Button, Tab, Tabs } from '@blueprintjs/core';
import { SettingsTabs } from '../SettingsTabs';
import { EditorSettings } from '../pages/EditorSettings';
import { GeneralSettings } from '../pages/GeneralSettings';
import { useState } from 'react';
import { AboutDependenciesPage } from './AboutDependenciesPage';
import { AboutYanaPage } from './AboutYanaPage';

enum AboutPageTabs {
  AboutYana,
  Dependencies,
}

export const AboutContainerPage: React.FC<{}> = props => {
  const [currentTab, setCurrentTab] = useState(AboutPageTabs.AboutYana);

  return (
    <PageContainer
      header={
        <PageHeader
          title={'About Yana'}
          icon="help"
          lowerContentFlush={true}
          lowerContent={
            <Tabs onChange={(newTabId: AboutPageTabs) => setCurrentTab(newTabId)} selectedTabId={currentTab}>
              <Tab id={AboutPageTabs.AboutYana} title="About Yana" />
              <Tab id={AboutPageTabs.Dependencies} title="Dependencies" />
            </Tabs>
          }
        />
      }
    >
      {(() => {
        switch (currentTab) {
          case AboutPageTabs.Dependencies:
            return <AboutDependenciesPage />;
          default:
          case AboutPageTabs.AboutYana:
            return <AboutYanaPage />;
        }
      })()}
    </PageContainer>
  );
};
