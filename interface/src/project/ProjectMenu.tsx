import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import {List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';

import { PROJECT_PATH } from '../api';

const ProjectMenu = (props : RouteComponentProps) => {

    const path = props.match.url;
    return (
      <List>
        <ListItem to={`/${PROJECT_PATH}/`} selected={path.startsWith(`/${PROJECT_PATH}/`)} button component={Link}>
          <ListItemIcon>
            <SettingsRemoteIcon />
          </ListItemIcon>
          <ListItemText primary="ESPrinkler" />
        </ListItem>
      </List>
    );

}

export default withRouter(ProjectMenu);
