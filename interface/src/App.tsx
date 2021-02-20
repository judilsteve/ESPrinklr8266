import React, { useEffect, useRef } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { SnackbarProvider } from 'notistack';

import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import AppRouting from './AppRouting';
import CustomMuiTheme from './CustomMuiTheme';
import { PROJECT_NAME } from './api';
import FeaturesWrapper from './features/FeaturesWrapper';

// this redirect forces a call to authenticationContext.refresh() which invalidates the JWT if it is invalid.
const unauthorizedRedirect = () => <Redirect to="/" />;

const App = () => {

    const notistackRef = useRef<any>(null);

    useEffect(() => {
        document.title = PROJECT_NAME;
    }, []);

    const onClickDismiss = (key: string | number | undefined) => () => {
        notistackRef.current?.closeSnackbar(key);
    }

    return (
        <CustomMuiTheme>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            ref={notistackRef}
            action={(key) => (
            <IconButton onClick={onClickDismiss(key)} size="small">
                <CloseIcon />
            </IconButton>
            )}>
            <FeaturesWrapper>
            <Switch>
                <Route exact path="/unauthorized" component={unauthorizedRedirect} />
                <Route component={AppRouting} />
            </Switch>
            </FeaturesWrapper>
        </SnackbarProvider>
        </CustomMuiTheme>
    );
}

export default App
