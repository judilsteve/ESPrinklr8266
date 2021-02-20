import React from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom'

import { Tabs, Tab } from '@material-ui/core';

import { AuthenticatedContextProps, withAuthenticatedContext, AuthenticatedRoute } from '../authentication';
import { MenuAppBar } from '../components';

import APSettingsController from './APSettingsController';
import APStatusController from './APStatusController';

type AccessPointProps = AuthenticatedContextProps & RouteComponentProps;

const AccessPoint = (props :AccessPointProps) => {

    const handleTabChange = (event: React.ChangeEvent<{}>, path: string) => {
        props.history.push(path);
    };

    const { authenticatedContext } = props;
    return (
        <MenuAppBar sectionTitle="Access Point">
        <Tabs value={props.match.url} onChange={handleTabChange} variant="fullWidth">
            <Tab value="/ap/status" label="Access Point Status" />
            <Tab value="/ap/settings" label="Access Point Settings" disabled={!authenticatedContext.me.admin} />
        </Tabs>
        <Switch>
            <AuthenticatedRoute exact path="/ap/status" component={APStatusController} />
            <AuthenticatedRoute exact path="/ap/settings" component={APSettingsController} />
            <Redirect to="/ap/status" />
        </Switch>
        </MenuAppBar>
    );
}

export default withAuthenticatedContext(AccessPoint);
