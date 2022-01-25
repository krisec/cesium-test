import logo from './logo.svg';
import './App.css';
import { Viewer, Scene, Globe, Camera, Entity, ImageryLayer } from 'resium';
import * as Cesium from 'cesium';
import { useState } from 'react';
import { Button, Drawer, Menu, MenuItem, Select } from '@mui/material';

const pointGraphics = {
  pixelSize: 10,
  heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
};
const terrainProvider = new Cesium.CesiumTerrainProvider({
  url: Cesium.IonResource.fromAssetId("1")
});


Cesium.Ion.defaultAccessToken =  "";

const openStreetMapDataSource = new Cesium.GeoJsonDataSource("OpenStreetMap Datasource");
const dataSources = new Cesium.DataSourceCollection();

const tileMatrixSetID = "EPSG:3857";
const mappedTileMatrixSet = []
const minZoom = 0;
const maxZoom = 20;

const mapLayers = [
  "norgeskart_bakgrunn",
  "topo4graatone"
]

const wmtsService = mapLayers.map(layer => new Cesium.WebMapTileServiceImageryProvider({
  url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
  layer: layer,
  tileMatrixSetID: tileMatrixSetID,
  style: "default",
  tileMatrixLabels: mappedTileMatrixSet,
  format:"image/png",
  maximumLevel:18,
  parameters: {
    version: "1.0.0",
  }
}));

openStreetMapDataSource.load("openmaptile.json", {clampToGround: true
}).then(datasource => {
  datasource.entities.values.forEach(entity => {
    entity.polygon.extrudedHeight = entity.properties.height || 3;
    entity.polygon.height = -2;
    entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
    entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
  });
});

dataSources.add(openStreetMapDataSource);

function App() {
  const [terrainHidesEntities, setTerrainHidesEntities] = useState(false);
  const [entities, setEntities] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mapLayer, setMapLayer] = useState("topo4graatone");

  let drawerWidth = "10%"

  const startPos = {
    lat: 59.5,
    lon: 10.8
  }

  const flipTerrainHidesEntities = () => {
    setTerrainHidesEntities(!terrainHidesEntities);
  }

  const addEntity = () => {
    setEntities([...entities, {
      position: Cesium.Cartesian3.fromDegrees(startPos.lon + 0.01 * entities.length, startPos.lat)
    }]);
  }

  const selectLayer = (event) => {
    setMapLayer(event.target.value);
  }


  for (let i = minZoom; i < maxZoom; i++) {
    mappedTileMatrixSet.push(`${tileMatrixSetID}:${i}`);
  }
  //https://gatekeeper3.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?gkt=528D93C726F7BF89D8DF67463E5ABE168F9EFFF130B0C1AB8DF829231A08590A7DF62C67F6239A932DAF24FAC0401415E0DFA1CAF0063D3D8D018F0853CD0DA1&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=topo4graatone&STYLE=default&FORMAT=image/png&TILEMATRIXSET=EPSG:25833&TILEMATRIX=EPSG:25833:5&TILEROW=10&TILECOL=14



  return (
    <div className="App">
      <Drawer
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
      >
        <Button onClick={flipTerrainHidesEntities}>Testing</Button>
        <Button onClick={addEntity}>Add entity</Button>
        <Select onChange={selectLayer} value={mapLayer}>
          <MenuItem value="topo4graatone">Topografisk Gråtone</MenuItem>
          <MenuItem value="norgeskart_bakgrunn">Norgeskart bakgrunn</MenuItem>
        </Select>
      </Drawer>
      <Viewer
        terrainProvider={terrainProvider}
        dataSources={dataSources}
        // imageryProvider={wmtsService}
        >
          {wmtsService.map(provider => <ImageryLayer imageryProvider={provider} key={provider._layer} show={mapLayer == provider._layer}/>)}
        <Scene />
        <Globe
          depthTestAgainstTerrain={terrainHidesEntities}
        />
        <Camera />

        {entities.map((entity, index) => <Entity 
          position={entity.position}
          point={pointGraphics}
          name={`Entity ${index}`}
          key={index}
        />)}
      </Viewer>
    </div>
  );
}

export default App;
