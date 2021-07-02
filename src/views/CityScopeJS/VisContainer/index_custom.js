import React from "react";
import { Typography, Divider, Container, Box } from "@material-ui/core";
import Radar from "./Radar";
import BarChart from "./BarChart";
import AreaCalc from "./AreaCalc";

function VisContainer(props) {
    return (
        <>
            {props.cityIOdata && (
                <Container style={{ height: '100%'}}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection="column">
                        <AreaCalc cityioData={props.cityIOdata} />
                        <Radar cityioData={props.cityIOdata} />
                        <BarChart cityioData={props.cityIOdata} />
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
