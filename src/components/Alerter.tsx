import { EventEmitter } from '../common/EventEmitter';
import { Alert, Checkbox, IAlertProps, InputGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { LogService } from '../common/LogService';
import cxs from 'cxs';

const logger = LogService.getLogger('Alerter');

interface AlertOptions extends Partial<IAlertProps> {
  content: React.ReactNode;
  prompt?:
    | {
        type: 'string';
        defaultValue?: string;
        placeholder?: string;
        onConfirmText: (value: string) => void;
      }
    | {
        type: 'boolean';
        defaultValue?: boolean;
        text: string;
        onConfirmBoolean: (value: boolean) => void;
      };
}

export class Alerter {
  private static _instance: Alerter;
  public onAlert = new EventEmitter<AlertOptions>();

  static get Instance() {
    if (!this._instance) {
      this._instance = new Alerter();
    }
    return this._instance;
  }

  private constructor() {
    logger.log('constructor');
  }

  public alert(options: AlertOptions) {
    logger.log('alert()', [], { options });
    this.onAlert.emit(options);
  }

  public Container: React.FC = props => {
    const [currentAlert, setCurrentAlert] = useState<AlertOptions | undefined>();
    const [textValue, setTextValue] = useState<string>('');
    const [booleanValue, setBooleanValue] = useState<boolean>(false);

    useEventChangeHandler(this.onAlert, setCurrentAlert, []);
    useEffect(() => logger.log('mounted'), []);
    useEffect(() => {
      if (currentAlert?.prompt?.type === 'string') {
        setTextValue(currentAlert.prompt.defaultValue || '');
      } else if (currentAlert?.prompt?.type === 'boolean') {
        setBooleanValue(currentAlert.prompt.defaultValue || false);
      }
    }, [currentAlert]);

    if (currentAlert) {
      logger.log('Show alert', [], currentAlert);
      return (
        <Alert
          canOutsideClickCancel={true}
          canEscapeKeyCancel={true}
          className={cxs({ ' .bp3-alert-contents': { flexGrow: 1 } })}
          children={
            <>
              {currentAlert.content}
              {currentAlert?.prompt?.type === 'string' && (
                <InputGroup
                  value={textValue}
                  onChange={(e: any) => setTextValue(e.target.value)}
                  placeholder={currentAlert.prompt.placeholder}
                  fill={true}
                  autoFocus={true}
                />
              )}
              {currentAlert?.prompt?.type === 'boolean' && (
                <Checkbox
                  checked={booleanValue}
                  onChange={(e: any) => setBooleanValue(e.target.checked)}
                  label={currentAlert.prompt.text}
                />
              )}
            </>
          }
          {...currentAlert}
          onClose={() => setCurrentAlert(undefined)}
          onConfirm={() =>
            currentAlert?.prompt?.type === 'string'
              ? currentAlert.prompt.onConfirmText(textValue)
              : currentAlert?.prompt?.type === 'boolean'
              ? currentAlert.prompt.onConfirmBoolean(booleanValue)
              : currentAlert?.onConfirm?.()
          }
          isOpen={true}
        />
      );
    } else {
      logger.log('Hide alert');
      return null;
    }
  };
}
