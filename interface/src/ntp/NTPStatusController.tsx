import React, { useEffect } from 'react';

import { restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { NTP_STATUS_ENDPOINT } from '../api';

import NTPStatusForm from './NTPStatusForm';
import { NTPStatus } from './types';

type NTPStatusControllerProps = RestControllerProps<NTPStatus>;

const NTPStatusController = (props : NTPStatusControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="NTP Status">
        <RestFormLoader
          {...props}
          render={formProps => <NTPStatusForm {...formProps} />}
        />
      </SectionContent>
    );

}

export default restController(NTP_STATUS_ENDPOINT, NTPStatusController);
