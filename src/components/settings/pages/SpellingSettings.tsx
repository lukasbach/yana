import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { remote } from 'electron';
import { useState } from 'react';
import { useAsyncEffect } from '../../../utils';
import { Menu, MenuItem, Popover, Tag } from '@blueprintjs/core';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { useSettingsPageContext } from '../SettingsContext';

const availableLanguages = remote.getCurrentWebContents().session.availableSpellCheckerLanguages;

export const SpellingSettings: React.FC<{}> = props => {
  const settings = useSettingsPageContext();
  const [specifiedLanguages, setSpecifiedLanguages] = useState<string[]>(settings.settings.spellingLanguages);
  const [words, setWords] = useState<string[]>([]);

  useAsyncEffect(async () => {
    const session = remote.getCurrentWebContents().session;
    setWords(await session.listWordsInSpellCheckerDictionary());
  }, []);

  useAsyncEffect(async () => {
    const session = remote.getCurrentWebContents().session;
    session.setSpellCheckerLanguages(specifiedLanguages);
    settings.changeSettings({ spellingLanguages: specifiedLanguages });
  }, [specifiedLanguages]);

  return (
    <div>
      <SettingsSection title="Spell Checking">
        <SettingsSwitchInput settingsKey={'spellingActive'} label="Spell Checking active" />
      </SettingsSection>

      <SettingsSection title="Spell Checker Languages">
        {specifiedLanguages.map(lang => (
          <Tag
            style={{ marginRight: '6px' }}
            round
            large
            onRemove={() => setSpecifiedLanguages(langs => langs.filter(lang2 => lang2 !== lang))}
          >
            {lang}
          </Tag>
        ))}
        <br />
        <br />
        {availableLanguages.length !== specifiedLanguages.length ? (
          <Popover
            boundary={'scrollParent'}
            content={
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <Menu>
                  {availableLanguages
                    .filter(lang => !specifiedLanguages.includes(lang))
                    .map(lang => (
                      <MenuItem text={lang} onClick={() => setSpecifiedLanguages(langs => [...langs, lang])} />
                    ))}
                </Menu>
              </div>
            }
          >
            <Tag style={{ marginRight: '6px' }} large interactive round icon={'plus'} intent={'success'}>
              Add new language
            </Tag>
          </Popover>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Custom words">
        {words.map(word => (
          <Tag
            style={{ marginRight: '6px' }}
            large
            round
            onRemove={() => {
              const session = remote.getCurrentWebContents().session;
              setWords(words => words.filter(w => w !== word));
              session.removeWordFromSpellCheckerDictionary(word);
            }}
          >
            {word}
          </Tag>
        ))}
        <p>To add a new word, write it in an editor, right click on it and add it to the spell checker.</p>
      </SettingsSection>
    </div>
  );
};
