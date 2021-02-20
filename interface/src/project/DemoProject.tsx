import React from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom'

import { Tabs, Tab } from '@material-ui/core';

import { PROJECT_PATH } from '../api';
import { MenuAppBar } from '../components';
import { AuthenticatedRoute } from '../authentication';

import DemoInformation from './DemoInformation';
import LightStateRestController from './LightStateRestController';

const DemoProject = (props: RouteComponentProps) => {

    const handleTabChange = (event: React.ChangeEvent<{}>, path: string) => {
        props.history.push(path);
    };

    return (
      <MenuAppBar sectionTitle="Demo Project">
        <Tabs value={props.match.url} onChange={handleTabChange} variant="fullWidth">
          <Tab value={`/${PROJECT_PATH}/demo/information`} label="Information" />
          <Tab value={`/${PROJECT_PATH}/demo/rest`} label="REST Controller" />
        </Tabs>
        <Switch>
          <AuthenticatedRoute exact path={`/${PROJECT_PATH}/demo/information`} component={DemoInformation} />
          <AuthenticatedRoute exact path={`/${PROJECT_PATH}/demo/rest`} component={LightStateRestController} />
          <Redirect to={`/${PROJECT_PATH}/demo/information`} />
        </Switch>
      </MenuAppBar>
    );

}

export default DemoProject;
