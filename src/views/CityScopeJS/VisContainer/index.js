import React from "react";
import { List, ListItem, Divider } from "@material-ui/core";
import Radar from "./Radar";
import BarChart from "./BarChart";
import AreaCalc from "./AreaCalc";

function VisContainer(props) {
    return (
        <>
            {props.cityIOdata && (
                <List>
                    <ListItem style={{justifyContent: "center"}}>
                        <AreaCalc cityioData={props.cityIOdata} widthChart={650} heightChart={450} areaFontSize={12} soloMode={true}/>
                    </ListItem>

                    <Divider />

                    <ListItem style={{justifyContent: "center"}}>
                        <Radar cityioData={props.cityIOdata} radarSize={400} radarFontSize={12}/>
                    </ListItem>

                    <Divider />

                    <ListItem style={{justifyContent: "center"}}>
                        <BarChart cityioData={props.cityIOdata} radarSize={400} radarFontSize={14}/>
                    </ListItem>
                </List>
            )}
        </>
    );
}

export default VisContainer;
