import React, { useState, useEffect, useRef } from 'react'
import PaintBrush from './components/PaintBrush'
import { useSelector, useDispatch } from 'react-redux'
import { listenToSlidersEvents } from '../../../redux/actions'
import {
  _proccessAccessData,
  _proccessGridData,
  _postMapEditsToCityIO,
} from '../../../utils/utils'
import { StaticMap } from 'react-map-gl'
import DeckGL from '@deck.gl/react'
import 'mapbox-gl/dist/mapbox-gl.css'
import settings from '../../../settings/settings.json'
import AnimationComponent from './components/AnimationComponent'
import { updateSunDirection, _setupSunEffects } from '../../../utils/utils'
import {
  AccessLayer,
  AggregatedTripsLayer,
  ABMLayer,
  GridLayer,
  TextualLayer,
  GeojsonLayer,
} from './deckglLayers'

import building0 from "../../../settings/Building_0.json";
// import building2 from "../../../settings/LandUse_0_white_color.json";
import axios from 'axios'
import onlyMapSetting from '../../../settings/onlyMapSetting.json';

export default function Map(props) {
  const pitchMap = props.pitchMap
  const zoomMap = props.zoomMap
  const autoRotate = props.autoRotate
  const onlyMap = props.onlyMap
  const [draggingWhileEditing, setDraggingWhileEditing] = useState(false)
  const [selectedCellsState, setSelectedCellsState] = useState(null)
  const [viewState, setViewState] = useState(settings.map.initialViewState)
  const [keyDownState, setKeyDownState] = useState(null)
  const [mousePos, setMousePos] = useState(null)
  const [mouseDown, setMouseDown] = useState(null)
  const [hoveredObj, setHoveredObj] = useState(null)
  const [access, setAccess] = useState(null)
  const [textualData, setTextualData] = useState(null)

  const [geojsonData, setGeojsonData] = useState(null)

  const [GEOGRID, setGEOGRID] = useState(null)
  const [ABM, setABM] = useState({})
  const [loaded, setLoaded] = useState(false)
  const effectsRef = useRef()
  const deckGL = useRef()

  const dispatch = useDispatch()

  const pickingRadius = 40

  const [
    cityioData,
    sliders,
    menu,

    selectedType,
    ABMmode,
  ] = useSelector((state) => [
    state.CITYIO,
    state.SLIDERS,
    state.MENU,
    state.SELECTED_TYPE,
    state.ABM_MODE,
  ])

  const currentScennario = useSelector((state) => state.CURRENT_SCENARIO);

  var ABMOn = menu.includes('ABM')
  if (autoRotate) {
    var rotateOn = autoRotate;
  } else {
    var rotateOn = menu.includes('ROTATE')
  }
  var shadowsOn = menu.includes('SHADOWS')
  var editOn = menu.includes('EDIT')
  var resetViewOn = menu.includes('RESET_VIEW')

  useEffect(() => {
    // fix deck view rotate
    _rightClickViewRotate()
    // setup sun effects
    _setupSunEffects(effectsRef, cityioData.GEOGRID.properties.header)
    // zoom map on CS table location
    _setViewStateToTableHeader()
    setLoaded(true)

    // set bright time
    let brightTime = 12;
    if (cityioData.GEOGRID.properties.header.tz) {
      brightTime += cityioData.GEOGRID.properties.header.tz;
    }
    updateSunDirection(brightTime, effectsRef)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loaded) return
    updateSunDirection(sliders.time[1], effectsRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliders.time])

  useEffect(() => {
    if (!loaded) return
    let shadowColor = shadowsOn ? [0, 0, 0, 0.5] : [0, 0, 0, 0]
    effectsRef.current[0].shadowColor = shadowColor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadowsOn])

  useEffect(() => {
    setGEOGRID(_proccessGridData(cityioData))

    if (cityioData.access) {
      setAccess(_proccessAccessData(cityioData.access))
    }

    if (cityioData.textual) {
      setTextualData(cityioData.textual)
    }

    if (cityioData.geojson) {
      setGeojsonData(cityioData.geojson)
    }

    if (cityioData.ABM2) {
      setABM(cityioData.ABM2)
    }
  }, [cityioData])

  useEffect(() => {
    if (!loaded) return
    if (!editOn) {
      let dataProps = []

      for (let i = 0; i < GEOGRID.features.length; i++) {
        dataProps[i] = GEOGRID.features[i].properties
      }
      _postMapEditsToCityIO(dataProps, cityioData.tableName, '/GEOGRIDDATA')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOn])

  useEffect(() => {
    if (!loaded) return
    _setViewStateToTableHeader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetViewOn])

  const writeOnlyMapSetting = () => {
    axios.post(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/save-only-map-settings`, {
      setting: JSON.stringify(viewState)
    }).then(res => {
      alert(res.data);
    }).catch(err => {
      alert(err.response.data);
      console.log(err);
    })
  }

  const onViewStateChange = ({ viewState }) => {
    setViewState(viewState)
  }

  // /**
  //  * resets the camera viewport
  //  * to cityIO header data
  //  * https://github.com/uber/deck.gl/blob/master/test/apps/viewport-transitions-flyTo/src/app.js
  //  */

  const _setViewStateToTableHeader = () => {
    const header = cityioData.GEOGRID.properties.header

    setViewState({
      ...viewState,
      // longitude: header.longitude,
      // latitude: header.latitude,
      // bearing: 360 - header.rotation,
      longitude: onlyMapSetting.longitude ?? 106.704854, // District 4
      latitude: onlyMapSetting.latitude ?? 10.760616, // District 4
      bearing: 0.35, // District 4
      zoom: zoomMap ?? (onlyMapSetting.zoom ?? 15.95), // 4k
      pitch: pitchMap ?? 0,
      orthographic: true,
    })
  }

  // /**
  //  * Description. fix deck issue
  //  * with rotate right botton
  //  */
  const _rightClickViewRotate = () => {
    document
      .getElementById('deckgl-wrapper')
      .addEventListener('contextmenu', (evt) => evt.preventDefault())
  }

  const getBuildingByCurrentScenario = () => {
    switch (currentScennario) {
      case 'hcm_scenario_0':
        return building0;
      // case 'hcm_scenario_2':
      //   return building2;
      default:
        return building0;
    }
  }

  const layersKey = {
    ABM: ABMLayer({
      data: ABM.trips,
      cityioData,
      ABMmode,
      zoomLevel: viewState.zoom,
      sliders,
    }),
    AGGREGATED_TRIPS: AggregatedTripsLayer({
      data: ABM.trips,
      cityioData,
      ABMmode,
    }),
    GRID: !onlyMap ? GridLayer({
      data: GEOGRID,
      editOn: menu.includes('EDIT'),
      state: {
        selectedType,
        keyDownState,
        selectedCellsState,
        pickingRadius,
      },
      updaters: {
        setSelectedCellsState,
        setDraggingWhileEditing,
        setHoveredObj,
      },
      deckGL,
    }) : GeojsonLayer({
      data: GEOGRID,
    }),
    // GRID: GeojsonLayer({
    //   data: GEOGRID,
    // }),
    ACCESS: AccessLayer({
      data: access,
      cellSize: cityioData.GEOGRID?.properties?.header.cellSize,
    }),
    TEXTUAL: TextualLayer({
      data: textualData && textualData,
      coordinates: GEOGRID,
    }),

    GEOJSON: GeojsonLayer({
      data: geojsonData && geojsonData,
      alphaColor: 220
    }),

    OUTSIDE_INTERACTIVE_AREA: GeojsonLayer({
      data: getBuildingByCurrentScenario(),
    }),
  }

  const layerOrder = [
    'TEXTUAL',
    'ABM',
    'AGGREGATED_TRIPS',
    'GEOJSON',
    'GRID',
    'ACCESS',
  ]

  const _renderLayers = () => {
    let layers = []
    if (!pitchMap) {
      for (var layer of layerOrder) {
        if (menu.includes(layer)) {
          layers.push(layersKey[layer])
        }
      }
    }
    else {
      /* Add Building layer if having pitchMap*/
      // if (currentScennario == 'hcm_scenario_0') {
      layers.push(layersKey['OUTSIDE_INTERACTIVE_AREA']);
      // }
      /* --! Add Building */
    }
    return layers
  }
  return (
    <div
      className="baseMap"
      onKeyDown={(e) => {
        setKeyDownState(e.nativeEvent.key);
        if (onlyMap) {
          if (e.nativeEvent.keyCode == 13) {
            console.log(e.nativeEvent);
            writeOnlyMapSetting();
          }
        }
      }}
      onKeyUp={() => setKeyDownState(null)}
      onMouseMove={(e) => setMousePos(e.nativeEvent)}
      onMouseUp={() => setMouseDown(false)}
      onMouseDown={() => setMouseDown(true)}
    >
      <PaintBrush
        editOn={editOn}
        mousePos={mousePos}
        selectedType={selectedType}
        pickingRadius={pickingRadius}
        mouseDown={mouseDown}
        hoveredObj={hoveredObj}
      />
      <AnimationComponent
        toggles={{ ABMOn, rotateOn }}
        state={{ sliders, viewState }}
        updaters={{
          listenToSlidersEvents,
          updateSunDirection,
          setViewState,
        }}
        dispatch={dispatch}
      />

      <DeckGL
        ref={deckGL}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        layers={_renderLayers()}
        effects={effectsRef.current}
        controller={{
          touchZoom: onlyMap || pitchMap ? false : true,
          touchRotate: onlyMap || pitchMap ? false : true,
          scrollZoom: {
            speed: onlyMap ? 0.001 : 0.1,
            smooth: true,
          },
          dragPan: !draggingWhileEditing,
          dragRotate: onlyMap || pitchMap ? false : !draggingWhileEditing,
          keyboard: true,
        }}
      >
        <StaticMap
          asyncRender={false}
          dragRotate={true}
          reuseMaps={true}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle={autoRotate ? "" : settings.map.mapStyle.sat}
          preventStyleDiffing={true}
        />
      </DeckGL>
    </div>
  )
}
