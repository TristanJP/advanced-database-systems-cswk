import React, { useContext } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import { QueryContext } from '../State/QueryState';
import 'typeface-roboto';
import '../../style/custom.scss';

const useStyles = makeStyles((theme) => ({
  root: {
    color: '#52af77',
    display: 'flex',
    paddingLeft: 2,
    paddingRight: 2,
  },
  FormControl: {
    margin: theme.spacing(1),
  },
  Checkbox: {
    color: '#52af77',
  },
  FormControlLabel: {
    color: '#52af77',
  },
}));

const checkboxList = [
  {
    name: 'antiSocialBehaviour',
    label: 'Anti-social Behaviour',
  },
  {
    name: 'bicycleTheft',
    label: 'Bicycle Theft',
  },
  {
    name: 'burglary',
    label: 'Burglary',
  },
  {
    name: 'criminalDamageAndArson',
    label: 'Criminal Damage And Arson',
  },
  {
    name: 'drugs',
    label: 'Drugs',
  },
  {
    name: 'otherCrime',
    label: 'Other Crime',
  },
  {
    name: 'otherTheft',
    label: 'Other Theft',
  },
  {
    name: 'possessionOfWeapons',
    label: 'Possession Of Weapons',
  },
  {
    name: 'publicOrder',
    label: 'Public Order',
  },
  {
    name: 'robbery',
    label: 'Robbery',
  },
  {
    name: 'shoplifting',
    label: 'Shoplifting',
  },
  {
    name: 'theftFromThePerson',
    label: 'Theft From The Person',
  },
  {
    name: 'vehicleCrime',
    label: 'Vehicle Crime',
  },
  {
    name: 'violenceAndSexualOffences',
    label: 'Violence And Sexual Offences',
  },
];

function handleChange(checked, crimeName, qState, qDispatch) {
  const currentlyChecked = qState.crimeType;
  if (checked) {
    currentlyChecked.delete(crimeName);
  } else {
    currentlyChecked.add(crimeName);
  }
  qDispatch({ type: 'SET_QUERY_VALUES', payload: { crimeType: currentlyChecked } });
}

export default function CheckboxesGroup() {
  const classes = useStyles();
  const { qDispatch, qState } = useContext(QueryContext);
  return (
    <>
      <FormControl component="fieldset" className={classes.formControl}>
        <Typography component="span" fontWeight={600} variant="subtitle2"> Select Crime Types </Typography>
        <FormGroup>
          {checkboxList.map((element) => (
            <FormControlLabel
              control={(
                qState.crimeType.has(element.label)
                  ? (
                    <Checkbox
                      checked
                      onChange={() => {
                        handleChange(true, element.label, qState, qDispatch);
                      }}
                      name={element.name}
                      key={element.name}
                    />
                  )
                  : (
                    <Checkbox
                      onChange={() => {
                        handleChange(false, element.label, qState, qDispatch);
                      }}
                      name={element.name}
                      key={element.name}
                    />
                  )
              )}
              label={element.label}
            />
          ))}
        </FormGroup>
      </FormControl>
    </>
  );
}
