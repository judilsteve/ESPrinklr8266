import React from 'react';
import { Features } from './types';

export interface ApplicationContext {
  features: Features;
}

const ApplicationContextDefaultValue = {} as ApplicationContext
export const ApplicationContext = React.createContext(
  ApplicationContextDefaultValue
);

export function withAuthenticatedContexApplicationContext<T extends ApplicationContext>(Component: React.ComponentType<T>) {
  return (props: Omit<T, keyof ApplicationContext>) => {
      return (
        <ApplicationContext.Consumer>
          {authenticatedContext => <Component {...props as T} features={authenticatedContext} />}
        </ApplicationContext.Consumer>
      );
  };
}
