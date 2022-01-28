import logo from './logo.svg';
import './App.css';
import token from './accesstoken'
import { Viewer, Scene, Globe, Camera, Entity, ImageryLayer, Cesium3DTileset, GeoJsonDataSource, CzmlDataSource, CameraFlyTo, PolygonGraphics } from 'resium';
import * as Cesium from 'cesium';
import { useEffect, useState } from 'react';
import { Button, Checkbox, Drawer, Menu, MenuItem, Select, FormControlLabel, FormGroup} from '@mui/material';

const pointGraphics = {
  pixelSize: 10,
  heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
};
const terrainProvider = new Cesium.CesiumTerrainProvider({
  url: Cesium.IonResource.fromAssetId("1")
});


const tileMatrixSetID = "EPSG:3857";
const mappedTileMatrixSet = []
const minZoom = 0;
const maxZoom = 18;
for (let i = minZoom; i < maxZoom; i++) {
  mappedTileMatrixSet.push(`${tileMatrixSetID}:${i}`);
}

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



const openStreetMapStartX = 17363;
const openStreetMapStartY = 9533;

const xTiles = 5;
const yTiles = 5;

const osmBuildingsURL = Cesium.IonResource.fromAssetId(96188);


Cesium.Ion.defaultAccessToken = token;

function App() {
  const [terrainHidesEntities, setTerrainHidesEntities] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [entities, setEntities] = useState([]);
  const [mapLayer, setMapLayer] = useState("topo4graatone");
  const [czml, setCzml] = useState({link: "akerselva_vannstand.czml", show: true});


  const [openStreetMapLinks, setOpenStreetMapLinks] = useState([]);

  const geoJsonPromise = (datasource) => {
    if (!datasource) return;
    datasource.entities.values.forEach(entity => {
      entity.polygon.extrudedHeight = entity.properties.height || 3;
      entity.polygon.height = -2;
      entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
      entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
    });
    // dataSources.add(datasource);
  }

  useEffect(() => {
    let osmElements = [];
    for(let y = openStreetMapStartY - Math.floor(yTiles/2); y < openStreetMapStartY + Math.floor(yTiles/2); y++){
      for(let x = openStreetMapStartX - Math.floor(xTiles/2); x < openStreetMapStartX + Math.floor(xTiles/2); x++){
        osmElements.push({link: `https://data.osmbuildings.org/0.2/anonymous/tile/15/${x}/${y}.json`, show: true, name: `OSM ${x}, ${y}`});
      }
    }
    setOpenStreetMapLinks(osmElements);
  }, [])

  const startPos = {
    lat: 59.5,
    lon: 10.8
  }

  const addEntity = () => {
    setEntities([...entities, {
      position: Cesium.Cartesian3.fromDegrees(startPos.lon + 0.01 * entities.length, startPos.lat)
    }]);
  }

  const selectLayer = (event) => {
    setMapLayer(event.target.value);
  }

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
        <Button onClick={flipTerrainHidesEntities}>Testing</Button>
        <Button onClick={addEntity}>Add entity</Button>
        <Select onChange={selectLayer} value={mapLayer}>
          <MenuItem value="topo4graatone">Topografisk Gråtone</MenuItem>
          <MenuItem value="norgeskart_bakgrunn">Norgeskart bakgrunn</MenuItem>
        </Select>
        <FormGroup>
        <FormControlLabel
          label="All OpenStreetMaps"
          control={
            <Checkbox
              checked={openStreetMapLinks.every(el => el.show)}
              indeterminate={openStreetMapLinks.some(el => el.show) && !openStreetMapLinks.every(el => el.show)}
              onChange={() => {
                if (openStreetMapLinks.some(el => el.show)) {
                  setOpenStreetMapLinks(openStreetMapLinks.map(el => ({...el, show: false})));
                } else {
                  setOpenStreetMapLinks(openStreetMapLinks.map(el => ({...el, show: true})));
                }
              }}
            />
          }
        />
        {openStreetMapLinks.map(source => <FormControlLabel
        onClick={() => setOpenStreetMapLinks(openStreetMapLinks.map(el => el.name === source.name ? {...el, show: !el.show} : el))}
        label={source.name}
        control={<Checkbox
        checked={source.show}
        key={source.link}
        />}
        />)}
        <FormControlLabel
        label="Akerselva CZML"
        onClick={() => setCzml({...czml, show: !czml.show})}
        control={<Checkbox 
          checked={czml.show}
          />}
        />
        </FormGroup>

      </Drawer>
      <Viewer
        style={{
          width: "80%",
          height:"100%",
          marginLeft: "20%"
        }}
        terrainProvider={terrainProvider}
      >
        <Scene />
        <Globe
          depthTestAgainstTerrain={terrainHidesEntities}
        />
        <Camera
        />
        {wmtsService.map(provider => <ImageryLayer imageryProvider={provider} key={provider._layer} show={mapLayer == provider._layer}/>)}
        {openStreetMapLinks.map(OSM => <GeoJsonDataSource data={OSM.link} onLoad={geoJsonPromise} show={OSM.show} key={OSM.name}/>)}
        {entities.map((entity, index) => <Entity 
          position={entity.position}
          point={pointGraphics}
          name={`Entity ${index}`}
          key={index}
        />)}
        <CzmlDataSource data={czml.link} show={czml.show} />
        <Cesium3DTileset url={osmBuildingsURL}/>
      </Viewer>
    </div>
  );
}

export default App;
