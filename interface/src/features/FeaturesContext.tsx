import React from 'react';
import { Features } from './types';

export interface FeaturesContext {
  features: Features;
}

const FeaturesContextDefaultValue = {} as FeaturesContext
export const FeaturesContext = React.createContext(
  FeaturesContextDefaultValue
);

export interface WithFeaturesProps {
  features: Features;
}

export function withFeatures<T extends WithFeaturesProps>(Component: React.ComponentType<T>) {
  return (props : Omit<T, keyof WithFeaturesProps>) => {
      return (
        <FeaturesContext.Consumer>
          {featuresContext => <Component {...props as T} features={featuresContext.features} />}
        </FeaturesContext.Consumer>
      );
  };
}
