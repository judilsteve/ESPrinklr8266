import React from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom'

import { Tabs, Tab } from '@material-ui/core';

import { WithFeaturesProps, withFeatures } from '../features/FeaturesContext';

import { withAuthenticatedContext, AuthenticatedContextProps, AuthenticatedRoute } from '../authentication';
import { MenuAppBar } from '../components';

import SystemStatusController from './SystemStatusController';
import OTASettingsController from './OTASettingsController';
import UploadFirmwareController from './UploadFirmwareController';

type SystemProps = AuthenticatedContextProps & RouteComponentProps & WithFeaturesProps;

const System = (props: SystemProps) => {

    const handleTabChange = (event: React.ChangeEvent<{}>, path: string) => {
        props.history.push(path);
    };

    const { authenticatedContext, features } = props;
    return (
      <MenuAppBar sectionTitle="System">
        <Tabs value={props.match.url} onChange={handleTabChange} variant="fullWidth">
          <Tab value="/system/status" label="System Status" />
          {features.ota && (
            <Tab value="/system/ota" label="OTA Settings" disabled={!authenticatedContext.me.admin} />
          )}
          {features.upload_firmware && (
            <Tab value="/system/upload" label="Upload Firmware" disabled={!authenticatedContext.me.admin} />
          )}
        </Tabs>
        <Switch>
          <AuthenticatedRoute exact path="/system/status" component={SystemStatusController} />
          {features.ota && (
            <AuthenticatedRoute exact path="/system/ota" component={OTASettingsController} />
          )}
          {features.upload_firmware && (
            <AuthenticatedRoute exact path="/system/upload" component={UploadFirmwareController} />
          )}
          <Redirect to="/system/status" />
        </Switch>
      </MenuAppBar>
    );
}

export default withFeatures(withAuthenticatedContext(System));
