import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { SECURITY_SETTINGS_ENDPOINT } from '../api';

import ManageUsersForm from './ManageUsersForm';
import { SecuritySettings } from './types';

type ManageUsersControllerProps = RestControllerProps<SecuritySettings>;

const ManageUsersController = (props: ManageUsersControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="Manage Users" titleGutter>
        <RestFormLoader
          {...props}
          render={formProps => <ManageUsersForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(SECURITY_SETTINGS_ENDPOINT, ManageUsersController);
