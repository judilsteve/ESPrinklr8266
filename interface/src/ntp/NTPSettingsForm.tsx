import React, { useEffect } from 'react';
import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import SaveIcon from '@material-ui/icons/Save';
import { BlockFormControlLabel, FormActions, FormButton, RestFormProps } from '../components';
import { isIP, isHostname, or } from '../validators';

import { TIME_ZONES, timeZoneSelectItems, selectedTimeZone } from './TZ';
import { NTPSettings } from './types';
import { Checkbox, MenuItem } from '@material-ui/core';

type NTPSettingsFormProps = RestFormProps<NTPSettings>;

const NTPSettingsForm = (props : NTPSettingsFormProps) => {

    useEffect(() => {
        const ruleName = 'isIPOrHostname';
        ValidatorForm.addValidationRule(ruleName, or(isIP, isHostname));
        return () => ValidatorForm.removeValidationRule(ruleName);
    }, []);

    const changeTimeZone = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { data, setData } = props;
        setData({
            ...data,
            tz_label: event.target.value,
            tz_format: TIME_ZONES[event.target.value]
        });
    }

    const { data, handleValueChange, saveData } = props;
    return (
      <ValidatorForm onSubmit={saveData}>
        <BlockFormControlLabel
          control={
            <Checkbox
              checked={data.enabled}
              onChange={handleValueChange('enabled')}
              value="enabled"
            />
          }
          label="Enable NTP?"
        />
        <TextValidator
          validators={['required', 'isIPOrHostname']}
          errorMessages={['Server is required', "Not a valid IP address or hostname"]}
          name="server"
          label="Server"
          fullWidth
          variant="outlined"
          value={data.server}
          onChange={handleValueChange('server')}
          margin="normal"
        />
        <SelectValidator
          validators={['required']}
          errorMessages={['Time zone is required']}
          name="tz_label"
          label="Time zone"
          fullWidth
          variant="outlined"
          native="true"
          value={selectedTimeZone(data.tz_label, data.tz_format)}
          onChange={changeTimeZone}
          margin="normal"
        >
          <MenuItem disabled>Time zone...</MenuItem>
          {timeZoneSelectItems()}
        </SelectValidator>
        <FormActions>
          <FormButton startIcon={<SaveIcon />} variant="contained" color="primary" type="submit">
            Save
          </FormButton>
        </FormActions>
      </ValidatorForm>
    );
}

export default NTPSettingsForm;
