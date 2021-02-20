import React, { FC, useEffect, useState } from 'react';

import { Features } from './types';
import { FeaturesContext } from './FeaturesContext';
import FullScreenLoading from '../components/FullScreenLoading';
import ApplicationError from '../components/ApplicationError';
import { FEATURES_ENDPOINT } from '../api';

const FeaturesWrapper : FC = props => {

    const [features, setFeatures] = useState<Features | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(FEATURES_ENDPOINT);
                if(response.status === 200) {
                    setFeatures(await response.json())
                } else throw Error(`Unexpected status code: ${response.status}`);
            } catch(error) {
                setError(error.message);
            }
        })();
    }, []);

    if (features) {
      return (
        <FeaturesContext.Provider value={{
          features
        }}>
          {props.children}
        </FeaturesContext.Provider>
      );
    }
    if (error) {
      return (
        <ApplicationError error={error} />
      );
    }
    return (
      <FullScreenLoading />
    );

}

export default FeaturesWrapper;
