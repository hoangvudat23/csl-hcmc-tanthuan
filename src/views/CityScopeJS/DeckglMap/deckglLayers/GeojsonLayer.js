import { GeoJsonLayer } from 'deck.gl'
import { hexToRgb } from '../../../../utils/utils'

export default function GeojsonLayer({ data, alphaColor = 255, isTv1 = true }) {
  return new GeoJsonLayer({
    id: 'GeojsonLayer',
    data,
    pickable: true,
    wireframe: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 1,
    getFillColor: (d) => { return d.properties.TypeCode && d.properties.TypeCode == "DGT" ? ( isTv1 ? [0,0,0,0] :[248, 249, 250, 255]) : hexToRgb(d.properties.fill, alphaColor) }, // push alpha
    getLineColor: (d) => hexToRgb(d.properties.stroke),
    lineWidthMinPixels: 2,
    getElevation: (d) => d.properties.height,
  })
}
