import chalk, { Chalk } from 'chalk';
import { log } from 'util';

enum LogLevel {
  debug,
  info,
  log,
  warn,
  error
}

type LogHandler = (description: string, appendedValues?: any[], subStructure?: object) => void;

export interface Logger {
  name: string;
  level: LogLevel;
  color: string[];
  out: LogHandler;
  log: LogHandler;
  warn: LogHandler;
  error: LogHandler;
  debug: LogHandler;
}


export class LogService {
  private static loggers: Logger[] = [];
  private static colorCounter = 0;
  private static colors = [
    ['#1abc9c', '#2c3e50'],
    ['#3498db', '#ecf0f1'],
    ['#e74c3c', '#ecf0f1'],
    ['#e67e22', '#ecf0f1'],
    ['#9b59b6', '#ecf0f1'],
    ['#f1c40f', '#ecf0f1'],
    ['#2ecc71', '#ecf0f1'],
    ['#95a5a6', '#2c3e50'],
  ];

  private static createLogger(name: string, level: LogLevel = LogLevel.log) {
    LogService.colorCounter++;
    LogService.colorCounter = LogService.colorCounter % LogService.colors.length;
    const color = LogService.colors[LogService.colorCounter];

    const createLogHandler = (level: LogLevel): LogHandler => (description, appendedValues = [], subStructure) => {
      let handler: (...a: any[]) => void;
      let prefixColor: Chalk;
      let prefixValue: string;

      switch (level) {
        case LogLevel.debug:
          handler = console.debug;
          prefixColor = chalk.blueBright;
          prefixValue = 'DEBUG';
          break;
        case LogLevel.info:
          handler = console.info;
          prefixColor = chalk.blue;
          prefixValue = 'INFO';
          break;
        case LogLevel.log:
          handler = console.log;
          prefixColor = chalk.black;
          prefixValue = 'LOG';
          break;
        case LogLevel.warn:
          handler = console.warn;
          prefixColor = chalk.yellow;
          prefixValue = 'WARN';
          break;
        case LogLevel.error:
          handler = console.error;
          prefixColor = chalk.red;
          prefixValue = 'ERROR';
          break;
      }

      const css = [
        `color: ${color[1]}; background: ${color[0]}`,
        `color: #000; background: #fff`,
        `color: #444; background: #fff`
      ]

      if (subStructure) {
        console.groupCollapsed(`%c[${name}]%c: ${description}. %c${appendedValues.map(v => JSON.stringify(v))}`, ...css);
      } else {
        handler(`%c[${name}]%c: ${description}. %c${appendedValues}`, ...css);
      }

      if (subStructure) {
        for (const [key, value] of Object.entries(subStructure)) {
          handler(`${key}:`, value);
        }
        console.groupEnd();
      }

      handler()
    }

    this.loggers.push({
      name,
      level,
      color,
      log: createLogHandler(LogLevel.log),
      debug: createLogHandler(LogLevel.debug),
      warn: createLogHandler(LogLevel.warn),
      error: createLogHandler(LogLevel.error),
      out: createLogHandler(level),
    });
    return this.loggers[this.loggers.length - 1];
  }

  static getLogger(name: string, level?: LogLevel) {
    return this.loggers.find(logger => logger.name === name) || this.createLogger(name, level);
  }
}
