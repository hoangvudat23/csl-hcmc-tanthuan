import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { listenToMenuUI } from "../../../redux/actions";
import TogglesMenu2 from "./TogglesMenu/index_mapchartmenu";
import {Typography, List, ListItem } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../../settings/settings.json";
import ChooseScenario from "./ChooseScenario";

function MenuContainer(props) {
    const { tableName } = props;
    const menuState = useSelector((state) => state.MENU);
    const cityioData = useSelector((state) => state.CITYIO);

    const loadedModules = Object.keys(cityioData);
    const togglesMeta = settings.menu.toggles;

    const dispatch = useDispatch();

    const handleToggle = (value) => () => {
        const i = menuState.indexOf(value);
        const updatedMenuState = [...menuState];
        if (i === -1) {
            updatedMenuState.push(value);
        } else {
            updatedMenuState.splice(i, 1);
        }
        dispatch(listenToMenuUI(updatedMenuState));
    };
    return (
        <>
            <List>
                <ListItem>
                    <Typography variant={"h1"}>View Options</Typography>
                </ListItem>
            </List>

            <TogglesMenu2 handleToggle={handleToggle} />
            {/* <ChooseScenario chosenScenario={chosenScenario} displayUI={true}/> */}
        </>
    );
}

export default MenuContainer;
