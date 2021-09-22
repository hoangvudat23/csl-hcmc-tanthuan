import React, { useState, useEffect } from "react";
import { rgbToHex } from "../../../../utils/utils";
import { RadialChart, Hint } from "react-vis";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import "../../../../../node_modules/react-vis/dist/style.css";
import { Chart } from "react-google-charts";

export default function AreaCalc(props) {
    // const radialRadius = 400;
    // const areaFontSize =  15;
    const widthChart = props.widthChart ? `${props.widthChart}px` : '2000px';
    const heightChart = props.heightChart ? `${props.heightChart}px` : '900px';
    const areaFontSize = props.areaFontSize ? props.areaFontSize : 22;
    const soloMode = props.soloMode ? props.soloMode : false;
    const [fakeControls, setFakeControls] = useState([]);
    const [hoveredRadial, setHoveredRadial] = useState(false);
    const [areaData, setAreaData] = useState(null);
    const [sliceColors, setSliceColors] = useState([]);
    const header = props.cityioData.GEOGRID?.properties?.header;
    useEffect(() => {
        const calcArea = () => {
            let gridProps = props.cityioData.GEOGRID.properties;
            let cellSize = gridProps.header.cellSize;
            let geoGridData = props.cityioData.GEOGRIDDATA;

            let calcAreaObj = {};
            geoGridData.forEach((gridCellData) => {
                let typeName = gridCellData.name;
                if (
                    //    if this type is not null
                    gridCellData.name !== "None"
                ) {
                    if (calcAreaObj.hasOwnProperty(typeName)) {
                        calcAreaObj[typeName].count =
                            calcAreaObj[typeName].count + 1;
                        // avoid landuse with no height
                        let height =
                            gridCellData.height < 1 ? 1 : gridCellData.height;
                        calcAreaObj[typeName].area =
                            calcAreaObj[typeName].area + height * cellSize;
                    } else {
                        calcAreaObj[typeName] = {};
                        calcAreaObj[typeName].area = 0;
                        calcAreaObj[typeName].count = 0;
                        calcAreaObj[typeName].name = typeName;
                        calcAreaObj[typeName].color = rgbToHex(
                            gridCellData.color[0],
                            gridCellData.color[1],
                            gridCellData.color[2]
                        );
                    }
                }
            });
            //  convert to react-vis happy data format
            // let radialData = [];

            // for (const k in calcAreaObj) {
            //     radialData.push(calcAreaObj[k]);
            // }

            // let data = {
            //     children: radialData,
            //     color: 1,
            // };

            let newRadialData = [
                ['Plot', 'Area']
            ];
            let sumArea = 0;
            let sliceColors = []
            for (const k in calcAreaObj) {
                sumArea = sumArea + calcAreaObj[k].area;
            }
            for (const k in calcAreaObj) {
                newRadialData.push([`${Math.round((calcAreaObj[k].area / sumArea * 100) * 10) / 10}% - ${calcAreaObj[k].name}`, calcAreaObj[k].area]);
                sliceColors.push({ color: calcAreaObj[k].color });
            }
            let data = {
                data: newRadialData,
                color: sliceColors
            }
            return data;
        };
        const calcAreaForHCM = () => {
            let gridProps = props.cityioData.GEOGRID.properties;
            let cellSize = gridProps.header.cellSize;
            let geoGridData = props.cityioData.GEOGRIDDATA;
            // console.log('geoGridData',geoGridData);

            let calcAreaObj = {};
            geoGridData.forEach((gridCellData) => {
                let typeName = gridCellData.LandUseTyp;
                let typeCode = gridCellData.TypeCode;
                let color = (gridCellData.RGB).split(',');
                let shapeArea = Math.round(gridCellData.ShapeArea * 100) / 100;
                if (
                    //    if this type is not null
                    gridCellData.TypeCode !== "None"
                ) {
                    if (calcAreaObj.hasOwnProperty(typeCode)) {
                        // calcAreaObj[typeCode].area = calcAreaObj[typeCode].area + gridCellData.Shape_Area;
                        calcAreaObj[typeCode].area = calcAreaObj[typeCode].area + shapeArea;
                    } else {
                        calcAreaObj[typeCode] = {};
                        // calcAreaObj[typeCode].area = gridCellData.Shape_Area;
                        calcAreaObj[typeCode].area = shapeArea;
                        calcAreaObj[typeCode].name = `${typeName} \n (${shapeArea})`;
                        calcAreaObj[typeCode].color = rgbToHex(
                            parseInt(color[0]),
                            parseInt(color[1]),
                            parseInt(color[2]),
                        );
                    }
                }
            });
            //  convert to react-vis happy data format
            let radialData = [];
            for (const k in calcAreaObj) {
                radialData.push(calcAreaObj[k]);
            }

            let data = {
                children: radialData,
                color: 1,
            };

            return data;
        };
        let d;
        // Calculate for general area
        // if (header.tableName && header.tableName.includes('hcmc_')) {
        //     d = calcAreaForHCM();
        // }
        // else {
        d = calcArea();
        // }
        setAreaData(d.data);
        setSliceColors(d.color);
    }, [props]);

    useEffect(() => {
        // change reference to trigger chart rerender
        setFakeControls([]);
    }, [widthChart, heightChart]);
    console.log(widthChart, heightChart);
    return (
        <List>
            {areaData && sliceColors && (
                <ListItem alignItems="center">
                    <Chart
                        controls={fakeControls}
                        width={widthChart}
                        height={heightChart}
                        chartType="PieChart"
                        loader={<div>Loading Chart</div>}
                        data={areaData}
                        options={{
                            backgroundColor: 'transparent',
                            legend: {
                                textStyle: {
                                    color: 'white',
                                    fontName: 'sans-serif',
                                    fontSize: areaFontSize,
                                },
                                position: 'right',
                                alignment: 'center',
                            },
                            slices: sliceColors,
                            chartArea: soloMode ? null : {
                                left: 550,
                                top: 100,
                                width: "100%",
                                height: "75%"
                            }
                        }}
                    />
                </ListItem>
            )}
        </List>
    );
}