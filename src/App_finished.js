import logo from './logo.svg';
import './App.css';
import token from './accesstoken'
import { Viewer, Scene, Globe, Camera, Entity, ImageryLayer, Cesium3DTileset, GeoJsonDataSource, CzmlDataSource, CameraFlyTo } from 'resium';
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


Cesium.Ion.defaultAccessToken = token;
// const mappableDatasources  = [];

// const openStreetMapDataSource = new Cesium.GeoJsonDataSource("OpenStreetMap Datasource");
// const dataSources = new Cesium.DataSourceCollection();


const openStreetMapStartX = 17363;
const openStreetMapStartY = 9533;

const xTiles = 5;
const yTiles = 5;

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

// dataSources.add(openStreetMapDataSource);

const osmBuildingsURL = Cesium.IonResource.fromAssetId(96188);

function App() {
  const [terrainHidesEntities, setTerrainHidesEntities] = useState(false);
  const [entities, setEntities] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mapLayer, setMapLayer] = useState("topo4graatone");
  const [czml, setCzml] = useState({link: "akerselva_vannstand.czml", show: true});
  // const [dataSources, setDataSources] = useState(new Cesium.DataSourceCollection());
  // const [mappableDatasources, setMappableDatasources] = useState([]);

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
  let drawerWidth = "20%";
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
        terrainProvider={terrainProvider}
        // dataSources={dataSources}
        style={{
          width: "80%",
          height:"100%",
          marginLeft: "20%"
      }}
        // imageryProvider={wmtsService}
        >
          {wmtsService.map(provider => <ImageryLayer imageryProvider={provider} key={provider._layer} show={mapLayer == provider._layer}/>)}
        <Scene />
        <Globe
          depthTestAgainstTerrain={terrainHidesEntities}
        />
        <Camera
        />
        <CameraFlyTo destination={Cesium.Cartesian3.fromDegrees(10.759415880187353, 59.90990667260775, 3000)}/>
        {openStreetMapLinks.map(OSM => <GeoJsonDataSource data={OSM.link} onLoad={geoJsonPromise} show={OSM.show} key={OSM.name}/>)}
        <CzmlDataSource data={czml.link} show={czml.show} />
        <Cesium3DTileset url={osmBuildingsURL}/>
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
