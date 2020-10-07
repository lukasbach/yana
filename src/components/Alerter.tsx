import { EventEmitter } from '../common/EventEmitter';
import { Alert, IAlertProps, InputGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { LogService } from '../common/LogService';
import cxs from 'cxs';

const logger = LogService.getLogger('Alerter');

interface AlertOptions extends Partial<IAlertProps> {
  content: React.ReactNode;
  prompt?: {
    defaultValue?: string;
    placeholder?: string;
    onConfirmText: (value: string) => void;
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
    logger.log('alert()', [], {options});
    this.onAlert.emit(options);
  }

  public Container: React.FC = props => {
    const [currentAlert, setCurrentAlert] = useState<AlertOptions | undefined>();
    const [textValue, setTextValue] = useState<string>('');

    useEventChangeHandler(this.onAlert, setCurrentAlert, []);
    useEffect(() => logger.log('mounted'), []);
    useEffect(() => {
      if (currentAlert?.prompt) {
        setTextValue(currentAlert.prompt.defaultValue || '');
      }
    }, [currentAlert])

    if (currentAlert) {
      logger.log('Show alert', [], currentAlert);
      return (
        <Alert
          canOutsideClickCancel={true}
          canEscapeKeyCancel={true}
          className={cxs({ ' .bp3-alert-contents': { flexGrow: 1 } })}
          children={(
            <>
              { currentAlert.content }
              { currentAlert.prompt && (
                <InputGroup
                  value={textValue}
                  onChange={(e: any) => setTextValue(e.target.value)}
                  placeholder={currentAlert.prompt.placeholder}
                  fill={true}
                  autoFocus={true}
                />
              ) }
            </>
          )}
          {...currentAlert}
          onClose={() => setCurrentAlert(undefined)}
          onConfirm={currentAlert.prompt ? (() => currentAlert?.prompt?.onConfirmText?.(textValue)) : (currentAlert?.onConfirm)}
          isOpen={true}
        />
      );
    } else {
      logger.log('Hide alert');
      return null;
    }
  }
}