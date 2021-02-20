import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { OTA_SETTINGS_ENDPOINT } from '../api';

import OTASettingsForm from './OTASettingsForm';
import { OTASettings } from './types';

type OTASettingsControllerProps = RestControllerProps<OTASettings>;

const OTASettingsController = (props: OTASettingsControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="OTA Settings" titleGutter>
        <RestFormLoader
          {...props}
          render={formProps => <OTASettingsForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(OTA_SETTINGS_ENDPOINT, OTASettingsController);
