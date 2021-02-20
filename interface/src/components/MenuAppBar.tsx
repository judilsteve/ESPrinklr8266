import React, { Fragment, useState, useRef, FC } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import { Drawer, AppBar, Toolbar, Avatar, Divider, Button, Box, IconButton } from '@material-ui/core';
import { ClickAwayListener, Popper, Hidden, Typography } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, ListItemAvatar } from '@material-ui/core';
import { Card, CardContent, CardActions } from '@material-ui/core';

import { withStyles, createStyles, Theme, WithTheme, WithStyles, withTheme } from '@material-ui/core/styles';

import WifiIcon from '@material-ui/icons/Wifi';
import SettingsIcon from '@material-ui/icons/Settings';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import LockIcon from '@material-ui/icons/Lock';
import MenuIcon from '@material-ui/icons/Menu';

import ProjectMenu from '../project/ProjectMenu';
import { PROJECT_NAME } from '../api';
import { withAuthenticatedContext, AuthenticatedContextProps } from '../authentication';
import { withFeatures, WithFeaturesProps } from '../features/FeaturesContext';

const drawerWidth = 290;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  title: {
    flexGrow: 1
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  toolbarImage: {
    [theme.breakpoints.up('xs')]: {
      height: 24,
      marginRight: theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
      height: 36,
      marginRight: theme.spacing(3)
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1
  },
  authMenu: {
    zIndex: theme.zIndex.tooltip,
    maxWidth: 400,
  },
  authMenuActions: {
    padding: theme.spacing(2),
    "& > * + *": {
      marginLeft: theme.spacing(2),
    }
  },
});

interface MenuAppBarProps extends WithFeaturesProps, AuthenticatedContextProps, WithTheme, WithStyles<typeof styles>, RouteComponentProps {
  sectionTitle: string;
}

export const MenuAppBar : FC<MenuAppBarProps> = props => {

    const [authMenuOpen, setAuthMenuOpen] = useState(false);

    const handleToggle = () => {
        setAuthMenuOpen(!authMenuOpen);
    };

    const anchorRef = useRef<HTMLButtonElement>(null);

    const handleClose = (event: React.MouseEvent<Document>) => {
        if (anchorRef.current && anchorRef.current?.contains(event.currentTarget)) {
            return;
        }
        setAuthMenuOpen(false);
    }

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const { classes, theme, children, sectionTitle, authenticatedContext, features } = props;
    const path = props.match.url;

    const drawer = (
      <div>
        <Toolbar>
          <Box display="flex">
            <img src="/app/icon.png" className={classes.toolbarImage} alt={PROJECT_NAME} />
          </Box>
          <Typography variant="h6" color="textPrimary">
            {PROJECT_NAME}
          </Typography>
          <Divider absolute />
        </Toolbar>
        {features.project && (
          <Fragment>
            <ProjectMenu />
            <Divider />
          </Fragment>
        )}
        <List>
          <ListItem to='/wifi/' selected={path.startsWith('/wifi/')} button component={Link}>
            <ListItemIcon>
              <WifiIcon />
            </ListItemIcon>
            <ListItemText primary="WiFi Connection" />
          </ListItem>
          <ListItem to='/ap/' selected={path.startsWith('/ap/')} button component={Link}>
            <ListItemIcon>
              <SettingsInputAntennaIcon />
            </ListItemIcon>
            <ListItemText primary="Access Point" />
          </ListItem>
          {features.ntp && (
          <ListItem to='/ntp/' selected={path.startsWith('/ntp/')} button component={Link}>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText primary="Network Time" />
          </ListItem>
          )}
          {features.mqtt && (
            <ListItem to='/mqtt/' selected={path.startsWith('/mqtt/')} button component={Link}>
              <ListItemIcon>
                <DeviceHubIcon />
              </ListItemIcon>
              <ListItemText primary="MQTT" />
            </ListItem>
          )}
          {features.security && (
            <ListItem to='/security/' selected={path.startsWith('/security/')} button component={Link} disabled={!authenticatedContext.me.admin}>
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText primary="Security" />
            </ListItem>
          )}
          <ListItem to='/system/' selected={path.startsWith('/system/')} button component={Link} >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="System" />
          </ListItem>
        </List>
      </div>
    );

    const userMenu = (
      <div>
        <IconButton
          ref={anchorRef}
          aria-owns={authMenuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="inherit"
        >
          <AccountCircleIcon />
        </IconButton>
        <Popper open={authMenuOpen} anchorEl={anchorRef.current} transition className={classes.authMenu}>
          <ClickAwayListener onClickAway={handleClose}>
            <Card id="menu-list-grow">
              <CardContent>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={"Signed in as: " + authenticatedContext.me.username} secondary={authenticatedContext.me.admin ? "Admin User" : undefined} />
                  </ListItem>
                </List>
              </CardContent>
              <Divider />
              <CardActions className={classes.authMenuActions}>
                <Button variant="contained" fullWidth color="primary" onClick={authenticatedContext.signOut}>Sign Out</Button>
              </CardActions>
            </Card>
          </ClickAwayListener>
        </Popper>
      </div>
    );

    return (
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar} elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap className={classes.title}>
              {sectionTitle}
            </Typography>
            {features.security && userMenu}
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden mdUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {children}
        </main>
      </div>
    );
}

export default withRouter(
  withTheme(
    withFeatures(
      withAuthenticatedContext(
        withStyles(styles)(MenuAppBar)
      )
    )
  )
);
