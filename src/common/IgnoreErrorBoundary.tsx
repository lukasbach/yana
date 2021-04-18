import * as React from 'react';
import { ErrorInfo } from 'react';

export class IgnoreErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // do nothing
  }

  render() {
    return this.props.children;
  }
}
