import React, { useContext, useRef } from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { QueryContext } from '../State/QueryState';
import 'typeface-roboto';

const marks = [
  {
    value: 0,
    label: '0 m',
  },
  {
    value: 10000,
    label: '10000 m',
  },
];


const SliderWithStyles = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

function changeSearchRadius(value, e, qDispatch) {
  qDispatch({ type: 'SET_QUERY_VALUES', payload: { distance: value } });
}


export default function DistanceSlider() {
  const { qDispatch } = useContext(QueryContext);
  const sliderRef = useRef(null);
  return (
    <>
      <Typography
        component="span"
        fontWeight={600}
        variant="subtitle2"
      >
            Distance slider
      </Typography>
      <SliderWithStyles
        marks={marks}
        ref={sliderRef}
        valueLabelDisplay="auto"
        aria-label="distance slider"
        onChange={(e, value) => { changeSearchRadius(value, e, qDispatch); }}
        min={0}
        max={10000}
        defaultValue={5000}
      />
    </>
  );
}
