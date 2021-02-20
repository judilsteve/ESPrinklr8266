import React, { useState } from 'react';
import { TextValidator, ValidatorComponentProps } from 'react-material-ui-form-validator';

import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';
import { InputAdornment, IconButton } from '@material-ui/core';
import {Visibility,VisibilityOff } from '@material-ui/icons';

const styles = createStyles({
  input: {
    "&::-ms-reveal": {
      display: "none"
    }
  }
});

type PasswordValidatorProps = WithStyles<typeof styles> & Exclude<ValidatorComponentProps, "type" | "InputProps">;

const PasswordValidator = (props: PasswordValidatorProps) => {

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const { classes, ...rest } = props;
    return (
      <TextValidator
        {...rest}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          classes,
          endAdornment:
            <InputAdornment position="end">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={toggleShowPassword}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
        }}
      />
    );

}

export default withStyles(styles)(PasswordValidator);
