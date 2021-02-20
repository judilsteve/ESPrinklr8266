import React, { useEffect } from 'react';

import { AP_SETTINGS_ENDPOINT } from '../api';
import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';

import APSettingsForm from './APSettingsForm';
import { APSettings } from './types';

type APSettingsControllerProps = RestControllerProps<APSettings>;

const APSettingsController = (props: APSettingsControllerProps) => {

    const { loadData } = props;

    useEffect(loadData, [loadData]);

    return (
    <SectionContent title="Access Point Settings" titleGutter>
        <RestFormLoader
        {...props}
        render={formProps => <APSettingsForm {...formProps} />}
        />
    </SectionContent>
    );

}

export default restController(AP_SETTINGS_ENDPOINT, APSettingsController);
