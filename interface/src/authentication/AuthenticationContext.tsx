import * as React from "react";

export interface Me {
  username: string;
  admin: boolean;
}

export interface AuthenticationContext {
  refresh: () => void;
  signIn: (accessToken: string) => void;
  signOut: () => void;
  me?: Me;
}

const AuthenticationContextDefaultValue = {} as AuthenticationContext
export const AuthenticationContext = React.createContext(
  AuthenticationContextDefaultValue
);

export interface AuthenticationContextProps {
  authenticationContext: AuthenticationContext;
}

export function withAuthenticationContext<T extends AuthenticationContextProps>(Component: React.ComponentType<T>) {
    return (props: Omit<T, keyof AuthenticationContextProps>) =>
        (<AuthenticationContext.Consumer>
            {authenticationContext => <Component {...props as T} authenticationContext={authenticationContext} />}
        </AuthenticationContext.Consumer>);
}

export interface AuthenticatedContext extends AuthenticationContext {
  me: Me;
}

const AuthenticatedContextDefaultValue = {} as AuthenticatedContext
export const AuthenticatedContext = React.createContext(
  AuthenticatedContextDefaultValue
);

export interface AuthenticatedContextProps {
  authenticatedContext: AuthenticatedContext;
}

export function withAuthenticatedContext<T extends AuthenticatedContextProps>(Component: React.ComponentType<T>) {
    return (props: Omit<T, keyof AuthenticatedContextProps>) => 
        (<AuthenticatedContext.Consumer>
          {authenticatedContext => <Component {...props as T} authenticatedContext={authenticatedContext} />}
        </AuthenticatedContext.Consumer>);
}
