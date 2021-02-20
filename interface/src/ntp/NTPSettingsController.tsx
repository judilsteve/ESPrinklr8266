import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { NTP_SETTINGS_ENDPOINT } from '../api';

import NTPSettingsForm from './NTPSettingsForm';
import { NTPSettings } from './types';

type NTPSettingsControllerProps = RestControllerProps<NTPSettings>;

const NTPSettingsController = (props: NTPSettingsControllerProps) => {

    const { loadData } = props;

    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="NTP Settings" titleGutter>
        <RestFormLoader
          {...props}
          render={formProps => <NTPSettingsForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(NTP_SETTINGS_ENDPOINT, NTPSettingsController);
