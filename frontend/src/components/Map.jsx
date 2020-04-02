import React from 'react';
import {
  Map,
  TileLayer,
  // Marker,
  // Popup,
} from 'react-leaflet';
import QueryDrawer from './QueryDrawer';
import '../../style/map.scss';


export default function RenderMap() {
  // const state = {
  //   lat: 51.505,
  //   lng: -0.09,
  //   zoom: 13,
  // };

  return (
    <div id="app-grid">
      <QueryDrawer />
      <Map center={[45.4, -75.7]} zoom={12}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map>
    </div>
  );
}
