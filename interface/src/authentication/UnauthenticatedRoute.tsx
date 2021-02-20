import * as React from 'react';
import { Redirect, Route, RouteProps, RouteComponentProps } from "react-router-dom";

import { withAuthenticationContext, AuthenticationContextProps } from './AuthenticationContext';
import * as Authentication from './Authentication';
import { WithFeaturesProps, withFeatures } from '../features/FeaturesContext';

interface UnauthenticatedRouteProps extends RouteProps, AuthenticationContextProps, WithFeaturesProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

const UnauthenticatedRoute = (props: UnauthenticatedRouteProps) => {

    const { authenticationContext, component: Component, features, ...rest } = props;
    const renderComponent: RenderComponent = (componentProps) => {
        if (authenticationContext.me) {
            return (<Redirect to={Authentication.fetchLoginRedirect(features)} />);
        }
        return (<Component {...componentProps} />);
    }
    return (
      <Route {...rest} render={renderComponent} />
    );
}

export default withFeatures(withAuthenticationContext(UnauthenticatedRoute));
