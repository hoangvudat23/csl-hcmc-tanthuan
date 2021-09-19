import React, { useState, useEffect } from "react";
import { Typography, Divider, Container, Box } from "@material-ui/core";
import Radar from "./Radar";
import BarChart from "./BarChart";
import AreaCalc from "./AreaCalc";
function VisContainer(props) {
    const chosenChart = props.chosenChart;
    const [displayPieChart, setDisplayPieChart] = useState({
        'display': false,
        'chartWidthSize': 2000,
        'chartHeightSize': 900,
        'fontSize': 22,
        'soloMode': false,
    });
    const [displayRadarChart, setDisplayRadarChart] = useState({
        'display': false,
        'chartSize': 1000,
        'fontSize': 20,
    });
    const [displayBarChart, setDisplayBarChart] = useState({
        'display': false,
        'chartSize': 400,
        'fontSize': 20,
    });

    useEffect(() => {
        switch (chosenChart) {
            case 'all':
                setDisplayPieChart({
                    'display': true,
                    'chartWidthSize': 2000,
                    'chartHeightSize': 900,
                    'fontSize': 22,
                    'soloMode': false,
                });
                setDisplayRadarChart({
                    'display': true,
                    'chartSize': 1000,
                    'fontSize': 20,
                });
                setDisplayBarChart({
                    'display': true,
                    'chartSize': 400,
                    'fontSize': 20,
                });
                break;
            case 'pie':
                setDisplayPieChart({
                    'display': true,
                    'chartWidthSize': 2500,
                    'chartHeightSize': 2000,
                    'fontSize': 35,
                    'soloMode': true,
                });
                setDisplayRadarChart({
                    'display': false
                });
                setDisplayBarChart({
                    'display': false
                });
                break;
            case 'radar':
                setDisplayRadarChart({
                    'display': true,
                    'chartSize': 2000,
                    'fontSize': 30,
                });
                setDisplayPieChart({
                    'display': false,
                });
                setDisplayBarChart({
                    'display': false,
                });
                break;
            case 'bar':
                setDisplayBarChart({
                    'display': true,
                    'chartSize': 1800,
                    'fontSize': 50,
                });
                setDisplayPieChart({
                    'display': false,
                });
                setDisplayRadarChart({
                    'display': false,
                });
                break;
            default:
                break;
        }
    }, [props]);
    return (
        <>
            {props.cityIOdata && (
                <Container style={{ height: '100%' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" style={{ height: '90%' }}>
                        {(displayPieChart.display) && (<AreaCalc cityioData={props.cityIOdata} widthChart={displayPieChart.chartWidthSize} heightChart={displayPieChart.chartHeightSize} areaFontSize={displayPieChart.fontSize} soloMode={displayPieChart.soloMode} />)}
                        {displayRadarChart.display && (<Radar cityioData={props.cityIOdata} radarSize={displayRadarChart.chartSize} radarFontSize={displayRadarChart.fontSize} />)}
                        {displayBarChart.display && (<BarChart cityioData={props.cityIOdata} radarSize={displayBarChart.chartSize} radarFontSize={displayBarChart.fontSize} />)}
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="end" flexDirection="column" mt={8}>
                        <Typography color="textPrimary" variant="h1">
                            MIT CityScope
                        </Typography>
                    </Box>
                </Container>
                //<Container>
                //    <Box display="flex" alignItems="center" justifyContent="space-between">
                //        <AreaCalc cityioData={props.cityIOdata} />
                //        <Radar cityioData={props.cityIOdata} />
                //    </Box>
                //    <Divider />
                //    <Box display="flex" alignItems="center" justifyContent="center">
                //        <BarChart cityioData={props.cityIOdata} />
                //    </Box>
                //</Container>
            )}
        </>
    );
}

export default VisContainer;
