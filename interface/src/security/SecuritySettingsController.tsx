import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { SECURITY_SETTINGS_ENDPOINT } from '../api';

import SecuritySettingsForm from './SecuritySettingsForm';
import { SecuritySettings } from './types';

type SecuritySettingsControllerProps = RestControllerProps<SecuritySettings>;

const SecuritySettingsController = (props: SecuritySettingsControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="Security Settings" titleGutter>
        <RestFormLoader
          {...props}
          render={formProps => <SecuritySettingsForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(SECURITY_SETTINGS_ENDPOINT, SecuritySettingsController);
