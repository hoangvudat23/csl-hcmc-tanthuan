import MenuContainer from './MenuContainer'
import MapContainer from './DeckglMap'
import LoadingSpinner from './CityIO/LoadingSpinner'
import VisContainer from './VisContainer/index_custom'
import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  Container,
} from '@material-ui/core'
import Page from '../../layouts/Page'

import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../settings/settings.json";
import { useSelector, useDispatch } from "react-redux";
import { listenToMenuUI, setCurrentScenario } from "../../redux/actions";
import ChooseScenario from "./MenuContainer/ChooseScenario"


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
    height: '100%',
    // paddingBottom: theme.spacing(3),
    // paddingTop: theme.spacing(3),
  },
}))

const getAPICall = async (URL) => {
  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export default function CSjsMainCustom(props) {
  const classes = useStyles()
  const tableName = props.tableName
  const cityIOdata = props.cityIOdata
  const onlyMap = props.onlyMap
  const onlyOptionMenu = props.onlyOptionMenu
  const onlyChartSidebar = props.onlyChartSidebar
  const mapAndChartSidebar = props.mapAndChartSidebar

  const menuState = useSelector((state) => state.MENU);
  const loadedModules = Object.keys(cityIOdata);
  const togglesMeta = settings.menu.toggles;

  const dispatch = useDispatch();
  let myMenuState = [...menuState];
  const [chosenScenario, setChosenScenario] = useState("");
  let myChosenScenario = 'hcm_scenario_0';
  const [chosenChart, setChosenChart] = useState("all");
  let myChosenChart = 'all';

  /* Listening View Option Change */
  useEffect(() => {
    const timer = setTimeout(listenChangingOption, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function listenChangingOption() {
    // recursively get hashes
    const options = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-option`);
    const scenarioObject = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-scenario`);
    const chartObject = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-chart`);
    if (options) {
      let table = options.table;
      let option = options.option;
      let mode = options.mode;
      if (table == tableName) {
        if (option) {
          let requireModule = togglesMeta[option].requireModule;
          if (loadedModules.includes(requireModule) || requireModule === false) {
            const i = myMenuState.indexOf(option);
            if (mode == "ON") {
              if (i === -1) {
                myMenuState.push(option);
              }
            }
            else {
              if (i !== -1) {
                myMenuState.splice(i, 1);
              }
            }
            dispatch(listenToMenuUI(myMenuState));
          }
        }
      }
    }
    if (scenarioObject) {
      let table = scenarioObject.scenario_table;
      if (table == tableName) {
        let scenario = scenarioObject.scenario;
        if (scenario && scenario != myChosenScenario) {
          myChosenScenario = scenario;
          setChosenScenario(scenario);
          dispatch(setCurrentScenario(scenario));
        }
      }
    }

    if (chartObject) {
      let table = chartObject.chart_table;
      if (table == tableName) {
        let chart = chartObject.chart;
        if (chart && chart != myChosenChart) {
          myChosenChart = chart;
          setChosenChart(chart);
        }
      }
    }
    setTimeout(listenChangingOption, 1000);
  }

  /* END Listening */

  return (
    <Page className={classes.root} title="CitySCopeJS">
      <LoadingSpinner />
      <Container maxWidth={null}
        style={{
          height: '100%',
          padding: '0px'
        }}>
        {/* <Grid container spacing={5}> */}
        <Grid container
          style={{
            height: '100%'
          }}
        >
          {onlyOptionMenu && <Grid item xs={12} l={12} md={12} xl={12} container>
            <Grid item container direction="column" spacing={2}>
              <Grid item xs={12} l={12} md={12} xl={12}>
                <Card
                  elevation={15}
                  style={{
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }}
                >
                  <CardContent>
                    <MenuContainer tableName={tableName} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>}

          {onlyMap && <Grid item xs={12} l={12} md={12} xl={12}>
            <Card
              elevation={15}
              style={{
                // height: '90vh',
                height: '100%',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* <Test/> */}
              <MapContainer onlyMap={true} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                maxHeight: '100%',
                height: '100%',
                overflow: 'hidden',
                boxShadow: 'none'
              }}
            >
              <VisContainer cityIOdata={cityIOdata} chosenChart={chosenChart} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'none'
              }}
            >
              {/* <Test/> */}
              {/* <iframe title="cityScience" allowfullscreen="true" width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.arcgis.com/apps/CEWebViewer/viewer.html?&3dWebScene=31d84c469a404bcbb13797d501286217&view=686441.41,11.16,-1189886.87,686778.3,2828.18,-1185381.71,0.95&lyr=1,1,1,1&wkid=32648&v=2"></iframe> */}
              <MapContainer pitchMap={30} zoomMap={15} autoRotate={true} />
            </Card>
          </Grid>}
          <Grid>
            <ChooseScenario chosenScenario={chosenScenario} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}
