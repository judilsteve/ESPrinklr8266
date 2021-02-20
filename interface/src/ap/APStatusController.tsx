import React, { useEffect } from 'react';

import {restController, RestControllerProps, RestFormLoader, SectionContent } from '../components';
import { AP_STATUS_ENDPOINT } from '../api';

import APStatusForm from './APStatusForm';
import { APStatus } from './types';

type APStatusControllerProps = RestControllerProps<APStatus>;

const APStatusController = (props: APStatusControllerProps) => {

    const { loadData } = props;

    useEffect(loadData, [loadData]);

    return (
      <SectionContent title="Access Point Status">
        <RestFormLoader
          {...props}
          render={formProps => <APStatusForm {...formProps} />}
        />
      </SectionContent>
    );
}

export default restController(AP_STATUS_ENDPOINT, APStatusController);
