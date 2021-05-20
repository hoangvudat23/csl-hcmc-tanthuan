import MenuContainer from './MenuContainer'
import MapContainer from './DeckglMap'
import LoadingSpinner from './CityIO/LoadingSpinner'
import VisContainer from './VisContainer'
import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  Container,
} from '@material-ui/core'
import Page from '../../layouts/Page'


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
}))


export default function CSjsMainCustom(props) {
  const classes = useStyles()
  const tableName = props.tableName
  const cityIOdata = props.cityIOdata
  const onlyMap = props.onlyMap
  const onlyOptionMenu = props.onlyOptionMenu
  const onlyChartSidebar = props.onlyChartSidebar

  return (
    <Page className={classes.root} title="CitySCopeJS">
      <LoadingSpinner />
      <Container maxWidth={null}>
        <Grid container spacing={5}>
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
                height: '90vh',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* <Test/> */}
              <MapContainer />
            </Card>
          </Grid>}
          {onlyChartSidebar &&<Grid item xs={12} l={12} md={12} xl={12}>
            <Card
              elevation={15}
              style={{
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <VisContainer cityIOdata={cityIOdata} />
            </Card>
          </Grid>}
        </Grid>
      </Container>
    </Page>
  )
}
