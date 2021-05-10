import proj4 from "proj4";
import { _hexToRgb } from "../../../EditorMap/EditorMap";
import scenario from '../../../../../settings/Scenario_2_geojson_wgs84.json';
import quyuoc from '../../../../../settings/quyuoc.json';


function deg_to_rad(deg) {
    return (deg * Math.PI) / 180;
}
function rad_to_deg(rad) {
    return (rad * 180) / Math.PI;
}

const randomProperty = (obj) => {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
};

const convertScenarioToWGS84 = (userPrj) => {
    proj4.defs('User-Projection', userPrj);
    userPrj = proj4.defs('User-Projection');
    let features = scenario.features;
    for (let i = 0; i < features.length; i++) {
        // let color = (typeof features[i].properties.MaQuyUoc !== 'undefined') ? quyuoc[features[i].properties.MaQuyUoc] : quyuoc.DGT;
        let color = "#00dd5c";
        features[i].properties.color = color;
        features[i].properties.stroke = color;
        features[i].properties['stroke-width'] = 2;
        features[i].properties['stroke-opacity'] = 1;
        features[i].properties.fill = color;
        features[i].properties['fill-opacity'] = 1;

        // if (features[i].geometry.type == "MultiPolygon") {
        //     for (let j = 0; j < features[i].geometry.coordinates.length; j++) {
        //         features[i].geometry.coordinates[j] = VN2kToWGSMultiLineString(features[i].geometry.coordinates[j], userPrj);
        //     }
        // } else {
        //     features[i].geometry.coordinates = VN2kToWGSMultiLineString(features[i].geometry.coordinates, userPrj);
        // }
    }
    let geojson = {
        "type": "FeatureCollection",
        "features": features,
    }
    console.log(geojson);
}

const VN2kToWGSMultiLineString = (coordinates, userPrj) => {
    for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
            coordinates[i][j] = proj4(userPrj, proj4.defs("EPSG:4326"), coordinates[i][j]);
        }
    }
    return coordinates;
}

export const gridCreator = (gridProps, typesList) => {
    let top_left_lon = parseFloat(gridProps.longitude);
    let top_left_lat = parseFloat(gridProps.latitude);
    let rotation = parseFloat(gridProps.rotation);
    let userPrj = gridProps.projection;
    let cell_size = parseFloat(gridProps.cellSize);
    let nrows = parseFloat(gridProps.nrows);
    let ncols = parseFloat(gridProps.ncols);

    const webMercator = proj4.defs("EPSG:4326");
    let EARTH_RADIUS_M = 6.371e6;
    let top_left_lon_lat = { lon: top_left_lon, lat: top_left_lat };
    let bearing = (90 - rotation + 360) % 360;
    let Ad = (cell_size * ncols) / EARTH_RADIUS_M;
    let la1 = deg_to_rad(top_left_lon_lat.lat);
    let lo1 = deg_to_rad(top_left_lon_lat.lon);
    let bearing_rad = deg_to_rad(bearing);
    let la2 = Math.asin(
        Math.sin(la1) * Math.cos(Ad) +
        Math.cos(la1) * Math.sin(Ad) * Math.cos(bearing_rad)
    );
    let lo2 =
        lo1 +
        Math.atan2(
            Math.sin(bearing_rad) * Math.sin(Ad) * Math.cos(la1),
            Math.cos(Ad) - Math.sin(la1) * Math.sin(la2)
        );
    let top_right_lon_lat = { lon: rad_to_deg(lo2), lat: rad_to_deg(la2) };
    let top_left_xy = proj4(webMercator, userPrj, [
        top_left_lon_lat.lon,
        top_left_lon_lat.lat,
    ]);

    let top_right_xy = proj4(webMercator, userPrj, [
        top_right_lon_lat.lon,
        top_right_lon_lat.lat,
    ]);

    let dydx =
        (top_right_xy[1] - top_left_xy[1]) / (top_right_xy[0] - top_left_xy[0]);
    let theta = Math.atan(dydx);
    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);
    // create rotate matrix
    let x_unRot = [];
    let y_unRot = [];
    for (let i = 0; i < nrows; i++) {
        for (let j = 0; j < ncols; j++) {
            x_unRot.push(j * cell_size);
            y_unRot.push(-i * cell_size);
        }
    }

    let x_rot = [];
    let y_rot = [];
    for (let i = 0; i < x_unRot.length; i++) {
        x_rot.push(x_unRot[i] * cosTheta - y_unRot[i] * sinTheta);
        y_rot.push(x_unRot[i] * sinTheta + y_unRot[i] * cosTheta);
    }

    let x_rot_trans = [];
    let y_rot_trans = [];
    for (let i = 0; i < x_rot.length; i++) {
        x_rot_trans.push(top_left_xy[0] + x_rot[i]);
        y_rot_trans.push(top_left_xy[1] + y_rot[i]);
    }

    var dxdCol = x_rot_trans[1] - x_rot_trans[0];
    var dydCol = y_rot_trans[1] - y_rot_trans[0];
    var dxdRow = x_rot_trans[ncols] - x_rot_trans[0];
    var dydRow = y_rot_trans[ncols] - y_rot_trans[0];

    let gridPnts = [];
    let geojsonFeatureCollection = {
        type: "FeatureCollection",
        // polygons go here
        features: [],
    };

    // get a list of types that is updated based on
    // the current redux state of the types list table
    let types = typesList;

    for (let i = 0; i < x_rot_trans.length; i++) {
        let rndType = randomProperty(types);

        let geojsonPolygon = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: null,
            },
            properties: {
                color: _hexToRgb(rndType.color),
                height: rndType.height,
                name: rndType.name,
                interactive: rndType.interactive,
                id: i,
            },
        };

        var polygon_xy = [
            [x_rot_trans[i], y_rot_trans[i]],
            [x_rot_trans[i] + dxdRow, y_rot_trans[i] + dydRow],
            [
                x_rot_trans[i] + dxdRow + dxdCol,
                y_rot_trans[i] + dydRow + dydCol,
            ],
            [x_rot_trans[i] + dxdCol, y_rot_trans[i] + dydCol],
            [x_rot_trans[i], y_rot_trans[i]],
        ];

        var polygon_ll = [];
        for (var v = 0; v < 5; v++) {
            let ll = proj4(userPrj, webMercator, polygon_xy[v]);

            polygon_ll.push(ll);
        }

        geojsonPolygon.geometry.coordinates = [polygon_ll];
        gridPnts.push(geojsonPolygon);
    }


    // let features = scenario.features;
    // for (let i = 0; i < features.length; i++) {

    //     features[i].properties.color = _hexToRgb('#e5e');
    //     features[i].properties.height = features[i].properties.TangCaoTD;
    //     features[i].properties.name = features[i].properties.ChucNang;
    //     features[i].properties.interactive = 'Web';
    //     features[i].properties.id = i;

    //     if(features[i].geometry.type == 'MultiPolygon'){

    //     }
    //     else{

    //     }
    //     // features[i].geometry.coordinates = 

    //     for (var v = 0; v < 5; v++) {
    //         let ll = proj4(userPrj, webMercator, polygon_xy[v]);

    //         polygon_ll.push(ll);
    //     }

    //     geojsonPolygon.geometry.coordinates = [polygon_ll];
    //     gridPnts.push(geojsonPolygon);
    // }
    geojsonFeatureCollection.features = gridPnts;

    // convertScenarioToWGS84(userPrj);
    return geojsonFeatureCollection;
};
