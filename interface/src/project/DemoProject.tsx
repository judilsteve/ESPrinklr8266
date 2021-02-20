import React from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom'

import { PROJECT_PATH } from '../api';
import { MenuAppBar } from '../components';
import { AuthenticatedRoute } from '../authentication';

import LightStateRestController from './LightStateRestController';

const DemoProject = (_: RouteComponentProps) => {

    return (
      <MenuAppBar sectionTitle="ESPrinkler">
        <Switch>
          <AuthenticatedRoute exact path={`/${PROJECT_PATH}/`} component={LightStateRestController} />
          <Redirect to={`/${PROJECT_PATH}/`} />
        </Switch>
      </MenuAppBar>
    );

}

export default DemoProject;
