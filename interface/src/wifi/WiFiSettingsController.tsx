import React, { useEffect } from 'react';

import { restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import WiFiSettingsForm from './WiFiSettingsForm';
import { WIFI_SETTINGS_ENDPOINT } from '../api';
import { WiFiSettings } from './types';

type WiFiSettingsControllerProps = RestControllerProps<WiFiSettings>;

const WiFiSettingsController = (props: WiFiSettingsControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="WiFi Settings">
        <RestFormLoader
          {...props}
          render={formProps => <WiFiSettingsForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(WIFI_SETTINGS_ENDPOINT, WiFiSettingsController);
