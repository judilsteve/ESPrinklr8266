import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import WiFiStatusForm from './WiFiStatusForm';
import { WIFI_STATUS_ENDPOINT } from '../api';
import { WiFiStatus } from './types';

type WiFiStatusControllerProps = RestControllerProps<WiFiStatus>;

const WiFiStatusController = (props: WiFiStatusControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="WiFi Status">
        <RestFormLoader
          {...props}
          render={formProps => <WiFiStatusForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(WIFI_STATUS_ENDPOINT, WiFiStatusController);
