import React, { useState } from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom'

import { Tabs, Tab } from '@material-ui/core';

import { withAuthenticatedContext, AuthenticatedContextProps, AuthenticatedRoute } from '../authentication';
import { MenuAppBar } from '../components';

import WiFiStatusController from './WiFiStatusController';
import WiFiSettingsController from './WiFiSettingsController';
import WiFiNetworkScanner from './WiFiNetworkScanner';
import { WiFiConnectionContext } from './WiFiConnectionContext';
import { WiFiNetwork } from './types';

type WiFiConnectionProps = AuthenticatedContextProps & RouteComponentProps;

const WiFiConnection = (props: WiFiConnectionProps) => {

    const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | undefined>(undefined);

    const selectNetwork = (network: WiFiNetwork) => {
        setSelectedNetwork(network);
        props.history.push('/wifi/settings');
    }

    const deselectNetwork = () => {
        setSelectedNetwork(undefined);
    }

    const handleTabChange = (_: React.ChangeEvent<{}>, path: string) => {
        props.history.push(path);
    };

    const context: WiFiConnectionContext = {
        selectNetwork: selectNetwork,
        deselectNetwork: deselectNetwork,
        selectedNetwork
    }

    const { authenticatedContext } = props;
    return (
      <WiFiConnectionContext.Provider value={context}>
        <MenuAppBar sectionTitle="WiFi Connection">
          <Tabs value={props.match.url} onChange={handleTabChange} variant="fullWidth">
            <Tab value="/wifi/status" label="WiFi Status" />
            <Tab value="/wifi/scan" label="Scan Networks" disabled={!authenticatedContext.me.admin} />
            <Tab value="/wifi/settings" label="WiFi Settings" disabled={!authenticatedContext.me.admin} />
          </Tabs>
          <Switch>
            <AuthenticatedRoute exact path="/wifi/status" component={WiFiStatusController} />
            <AuthenticatedRoute exact path="/wifi/scan" component={WiFiNetworkScanner} />
            <AuthenticatedRoute exact path="/wifi/settings" component={WiFiSettingsController} />
            <Redirect to="/wifi/status" />
          </Switch>
        </MenuAppBar>
      </WiFiConnectionContext.Provider>
    );
}

export default withAuthenticatedContext(WiFiConnection);
