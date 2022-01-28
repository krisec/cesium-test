import logo from './logo.svg';
import './App.css';
import token from './accesstoken'
import { Viewer, Scene, Globe, Camera, Entity, ImageryLayer, Cesium3DTileset, GeoJsonDataSource, CzmlDataSource, CameraFlyTo } from 'resium';
import * as Cesium from 'cesium';
import { useEffect, useState } from 'react';
import { Button, Checkbox, Drawer, Menu, MenuItem, Select, FormControlLabel, FormGroup} from '@mui/material';

Cesium.Ion.defaultAccessToken = token;

function App() {
  const [terrainHidesEntities, setTerrainHidesEntities] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const flipTerrainHidesEntities = () => {
    setTerrainHidesEntities(!terrainHidesEntities);
  }

  return (
    <div className="App">
      <Drawer
        open={drawerOpen}
        sx={{
          width: "20%",
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: "20%",
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
      >
      </Drawer>
      <Viewer
        style={{
          width: "80%",
          height:"100%",
          marginLeft: "20%"
        }}
      >
        <Scene />
        <Globe
          depthTestAgainstTerrain={terrainHidesEntities}
        />
        <Camera
        />
      </Viewer>
    </div>
  );
}

export default App;