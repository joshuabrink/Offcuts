
// const vectorLayer = new ol.layer.Vector({
//   source: new ol.source.Vector({
//     format: new ol.format.GeoJSON(),
//     url: '/geoson/countries'
//   }),
//   style: new ol.style.Style({
//     stroke: new ol.style.Stroke({ width: 5, color: 'blue' }),
//     fill: new ol.style.Fill({ color: 'red' })
//   })
// })

// const layer = new ol.layer.Tile({
//   source: new ol.source.OSM()
// })

// const map = new ol.Map({
//   target: mapEl,
//   layers: [
//     layer, vectorLayer
//   ],
//   view: new ol.View({
//     center: ol.proj.fromLonLat([mapEl.dataset.long, mapEl.dataset.lat]),
//     zoom: 10
//   })
// })

const mapEl = document.querySelector('#map')

const marker = new L.marker([mapEl.dataset.lat, mapEl.dataset.long])

function sendData () {
  return fetch('/geojson/countries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(points)
  })
    .then(response => response.json())
    .then(data => { return data })
}

const style = {
  weight: 2,
  opacity: 1,
  color: 'black',
  dashArray: '3',
  fillOpacity: 0.7
}
// const pt = turf.point([-77, 44])
const points = turf.helper.point([parseFloat(mapEl.dataset.long), parseFloat(mapEl.dataset.lat)])

function getData () {
  return fetch('/geojson/countries')
    .then(response => response.json())
    .then(data => { return data })
}

async function loadMap () {
  const data = await getData()

  const mapOptions = {
    center: [mapEl.dataset.lat, mapEl.dataset.long],
    zoom: 10
  }

  const map = new L.map(mapEl, mapOptions)

  const layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

  map.addLayer(layer)

  const vec = L.geoJSON(data, {
    style: style,
    onEachFeature: (feature, layer) => {
      // console.log(layer.feature.properties)
      let searchWithin = turf.helper.multiPolygon(feature.geometry.coordinates)
      if (feature.geometry.type === 'Polygon') searchWithin = turf.helper.polygon(feature.geometry.coordinates)

      if (turf.booleanPointInPolygon.default(points, searchWithin)) {
        console.log(layer.feature.properties)
        map.addLayer(layer)
      }
    }
  })

  // map.addLayer(vec)
}

loadMap()
