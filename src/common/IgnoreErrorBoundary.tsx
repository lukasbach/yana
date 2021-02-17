import * as React from 'react';
import { ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';

export class IgnoreErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error);
    // do nothing
  }

  render() {
    return this.props.children;
  }
}