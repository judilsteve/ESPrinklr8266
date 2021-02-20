import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { SYSTEM_STATUS_ENDPOINT } from '../api';

import SystemStatusForm from './SystemStatusForm';
import { SystemStatus } from './types';

type SystemStatusControllerProps = RestControllerProps<SystemStatus>;

const SystemStatusController = (props: SystemStatusControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="System Status">
        <RestFormLoader
          {...props}
          render={formProps => <SystemStatusForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(SYSTEM_STATUS_ENDPOINT, SystemStatusController);
