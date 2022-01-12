import logo from './logo.svg';
import './App.css';
import { Viewer, Scene, Globe, Camera, Entity } from 'resium';
import * as Cesium from 'cesium';
import { useState } from 'react';

const pointGraphics = {
  pixelSize: 10,
  heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
};
const terrainProvider = new Cesium.CesiumTerrainProvider({
  url: Cesium.IonResource.fromAssetId("1")
});


Cesium.Ion.defaultAccessToken =  "";




function App() {
  const [terrainHidesEntities, setTerrainHidesEntities] = useState(false);
  const [dataSources, setDataSources] = useState(new Cesium.DataSourceCollection());
  const [entities, setEntities] = useState([]);

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

  const geoJSONDataSource = new Cesium.GeoJsonDataSource("Example Source of GeoJSON data");
  geoJSONDataSource.load("./example.json");

  dataSources.add(geoJSONDataSource);

  return (
    <div className="App">
      <div>
        <button onClick={flipTerrainHidesEntities}>Testing</button>
        <button onClick={addEntity}>Add entity</button>
      </div>
      <Viewer
        terrainProvider={terrainProvider}
        dataSources={dataSources}
        >
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
