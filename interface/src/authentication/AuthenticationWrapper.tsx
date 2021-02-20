import React, { useCallback, useEffect, useState } from 'react';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import jwtDecode from 'jwt-decode';

import history from '../history'
import { VERIFY_AUTHORIZATION_ENDPOINT } from '../api';
import { ACCESS_TOKEN, authorizedFetch, getStorage } from './Authentication';
import { AuthenticationContext, Me } from './AuthenticationContext';
import FullScreenLoading from '../components/FullScreenLoading';
import { withFeatures, WithFeaturesProps } from '../features/FeaturesContext';

export const decodeMeJWT = (accessToken: string): Me => jwtDecode(accessToken);

type AuthenticationWrapperProps = WithSnackbarProps & WithFeaturesProps;

const AuthenticationWrapper : React.FC<AuthenticationWrapperProps> = props => {

    const { features: { security }, enqueueSnackbar, children } = props;
    const [user, setUser] = useState<Me | undefined>(undefined);
    const [initialised, setInitialised] = useState(false);

    const refresh = useCallback(() => {(async () => {
        let refreshedUser: Me | undefined;
        if (!security) {
            refreshedUser = { admin: true, username: "admin" };
        } else {
            const accessToken = getStorage().getItem(ACCESS_TOKEN);
            if (accessToken) {
                try {
                    const response = await authorizedFetch(VERIFY_AUTHORIZATION_ENDPOINT);
                    refreshedUser = response.status === 200 ? decodeMeJWT(accessToken) : undefined;
                } catch (error) {
                    refreshedUser = undefined;
                    enqueueSnackbar(`Error verifying authorization: ${error.message}`, {
                        variant: 'error',
                    });
                }
            } else {
                refreshedUser = undefined;
            }
        }
        setUser(refreshedUser);
        setInitialised(true);
    })(); }, [enqueueSnackbar, security]);

    useEffect(refresh, [refresh]);

    const signIn = useCallback((accessToken: string) => {
        try {
            getStorage().setItem(ACCESS_TOKEN, accessToken);
            const me = decodeMeJWT(accessToken);
            setUser(me);
            enqueueSnackbar(`Logged in as ${me.username}`, { variant: 'success' });
        } catch (err) {
            setUser(undefined);
            setInitialised(true);
            throw new Error("Failed to parse JWT " + err.message);
        }
    }, [enqueueSnackbar]);

    const signOut = useCallback(() => {
        getStorage().removeItem(ACCESS_TOKEN);
        setUser(undefined);
        enqueueSnackbar("You have signed out.", { variant: 'success', });
        history.push('/');
    }, [enqueueSnackbar]);

    return (<>
        {initialised ? <AuthenticationContext.Provider value={{ refresh, signIn, signOut, me: user }}>
            {children}
        </AuthenticationContext.Provider>
        : <FullScreenLoading />}
      </>);

}

export default withFeatures(withSnackbar(AuthenticationWrapper))
