import React, { useState } from 'react';
import { ValidatorForm } from 'react-material-ui-form-validator';

import { Table, TableBody, TableCell, TableHead, TableFooter, TableRow, withWidth, WithWidthProps, isWidthDown } from '@material-ui/core';
import { Box, Button, Typography, } from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import { withAuthenticatedContext, AuthenticatedContextProps } from '../authentication';
import { RestFormProps, FormActions, FormButton } from '../components';

import UserForm from './UserForm';
import { SecuritySettings, User } from './types';

function compareUsers(a: User, b: User) {
  if (a.username < b.username) {
    return -1;
  }
  if (a.username > b.username) {
    return 1;
  }
  return 0;
}

type ManageUsersFormProps = RestFormProps<SecuritySettings> & AuthenticatedContextProps & WithWidthProps;

const ManageUsersForm = (props: ManageUsersFormProps) => {

    const [creating, setCreating] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);

    const createUser = () => {
        setCreating(true);
        setUser({
            username: '',
            password: '',
            admin: true
        });
    };

    const uniqueUsername = (username: string) => {
        return !props.data.users.find(u => u.username === username);
    }

    const noAdminConfigured = !props.data.users.find(u => u.admin);

    const removeUser = (user: User) => {
        const { data } = props;
        const users = data.users.filter(u => u.username !== user.username);
        props.setData({ ...data, users });
    }

    const startEditingUser = (toEdit: User) => {
        setCreating(false);
        setUser(toEdit);
    };

    const cancelEditingUser = () => {
        setUser(undefined);
    }

    const doneEditingUser = () => {
        if (user) {
            const { data } = props;
            const users = data.users.filter(u => u.username !== user.username);
            users.push(user);
            props.setData({ ...data, users });
            setUser(undefined);
        }
    };

    const handleUserValueChange = (name: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...user, [name]: event.target.value };
        setUser(newUser as User);
    };

    const handleUserCheckboxChange = (name: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...user, [name]: event.target.checked };
        setUser(newUser as User);
    }

    const onSubmit = () => {
        props.saveData();
        props.authenticatedContext.refresh();
    }

    const { width, data } = props;
    return (
      <>
        <ValidatorForm onSubmit={onSubmit}>
          <Table size="small" padding={isWidthDown('xs', width!) ? "none" : "default"}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell align="center">Admin?</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.sort(compareUsers).map(user => (
                <TableRow key={user.username}>
                  <TableCell component="th" scope="row">
                    {user.username}
                  </TableCell>
                  <TableCell align="center">
                    {
                      user.admin ? <CheckIcon /> : <CloseIcon />
                    }
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" aria-label="Delete" onClick={() => removeUser(user)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small" aria-label="Edit" onClick={() => startEditingUser(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter >
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="center" padding="default">
                  <Button startIcon={<PersonAddIcon />} variant="contained" color="secondary" onClick={createUser}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          {
            noAdminConfigured &&
            (
              <Box bgcolor="error.main" color="error.contrastText" p={2} mt={2} mb={2}>
                <Typography variant="body1">
                  You must have at least one admin user configured.
                </Typography>
              </Box>
            )
          }
          <FormActions>
            <FormButton startIcon={<SaveIcon />} variant="contained" color="primary" type="submit" disabled={noAdminConfigured}>
              Save
            </FormButton>
          </FormActions>
        </ValidatorForm>
        {
          user &&
          <UserForm
            user={user}
            creating={creating}
            onDoneEditing={doneEditingUser}
            onCancelEditing={cancelEditingUser}
            handleValueChange={handleUserValueChange}
            handleCheckboxChange={handleUserCheckboxChange}
            uniqueUsername={uniqueUsername}
          />
        }
      </>
    );

}

export default withAuthenticatedContext(withWidth()(ManageUsersForm));
