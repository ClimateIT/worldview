import {
  assign as lodashAssign,
  find as lodashFind,
  get as lodashGet,
  groupBy as lodashGroupBy
} from 'lodash';
import { Stroke, Style, Fill, Circle } from 'ol/style';
import vectorDialog from '../../containers/vector-dialog';
import { setStyleFunction } from './selectors';
import { openCustomContent } from '../modal/actions';
import { selectVectorFeatures } from './actions';

export function getVectorStyleAttributeArray(layer) {
  var isCustomActive = false;
  var isMinActive = false;
  var isMaxActive = false;
  if (layer.custom) { isCustomActive = true; }
  if (layer.min) { isMinActive = true; }
  if (layer.max) { isMaxActive = true; }
  const styleObj = lodashAssign({}, { key: 'custom', value: layer.custom, isActive: isCustomActive });
  const minObj = lodashAssign({}, { key: 'min', value: layer.min, isActive: isMinActive });
  const maxObj = lodashAssign({}, { key: 'max', value: layer.max, isActive: isMaxActive });
  const attrArray = [];

  [styleObj, minObj, maxObj].forEach(obj => {
    if (obj.isActive) {
      attrArray.push({
        id: obj.key === 'custom' ? 'style' : obj.key,
        value: obj.value
      });
    } else {
      if (obj.isActive) {
        attrArray.push({
          id: obj.key === 'custom' ? 'style' : obj.key,
          value: ''
        });
      }
    }
  });
  return attrArray;
}

export function getMinValue(v) {
  return v.length ? v[0] : v;
}

export function getMaxValue(v) {
  return v.length ? v[v.length - 1] : v;
}
export function isConditional(item) {
  return Array.isArray(item) && item[0] === 'case';
}

export function selectedCircleStyle(style) {
  const styleImage = style.getImage();
  const fill = styleImage.getFill();
  const radius = styleImage.getRadius() * 1.25;
  return new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: 'white',
        width: 1
      }),
      fill: new Fill({
        color: fill.getColor().replace(/[^,]+(?=\))/, '0.5')
      })
    })
  });
}
export function selectedPolygonStyle(style) {
  const fill = style.getFill();
  const color = fill.getColor().replace(/[^,]+(?=\))/, '0.5')
  const stroke = style.getStroke();
  stroke.setColor('white');
  stroke.setWidth(0.5);
  fill.setColor(color);
  return style;
}
export function selectedStyleFunction(feature, styleArray) {
  if (styleArray.length !== 1) return styleArray;
  return styleArray.map((style) => {
    const type = feature.getType();
    switch (type) {
      case 'Point':
        return selectedCircleStyle(style);
      case 'Polygon':
        return selectedPolygonStyle(style);
      default:
        return style;
    }
  });
}
export function onMapClickGetVectorFeatures(e, map, store) {
  let metaArray = [];
  let selected = {};
  let defs = [];
  const state = store.getState();
  const lastSelection = state.vectorStyles.selected;
  const config = state.config;
  map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
    const def = lodashGet(layer, 'wv.def');
    if (!def) return;

    if (def.vectorData && def.vectorData.id && def.title) {
      const layerId = def.id;
      if (!selected[layerId]) selected[layerId] = [];
      let features = feature.getProperties();
      const vectorDataId = def.vectorData.id;
      const data = config.vectorData[vectorDataId];
      const properties = data.mvt_properties;
      const titleKey = lodashFind(properties, { Function: 'Identify' })['Identifier'];
      const title = features[titleKey];
      if (selected[layerId].includes(title)) return
      const obj = {
        legend: properties,
        features: features,
        id: vectorDataId,
        title: def.title || def.id,
        featureTitle: title
      };
      metaArray.push(obj);
      selected[layerId].push(title);
    }
  });
  if (Object.entries(selected).length || Object.entries(lastSelection).length) {
    store.dispatch(selectVectorFeatures(selected));
  }
  if (metaArray.length) {
    store.dispatch(openCustomContent('Vector-dialog' + e.pixel[0] + e.pixel[1],
      {
        backdrop: false,
        clickableBehindModal: true,
        desktopOnly: true,
        isDraggable: true,
        wrapClassName: 'vector-modal-wrap',
        modalClassName: 'vector-modal light',
        CompletelyCustomModal: vectorDialog,
        customProps: { vectorMetaObject: lodashGroupBy(metaArray, 'id') },
        onClose: () => {
          store.dispatch(selectVectorFeatures({}));
        }
      }
    ));
  };
}
export function updateVectorSelection(selectionObj, lastSelection, layers, type, state) {
  const vectorStyles = state.config.vectorStyles
  for (let [key, featureIdArray] of Object.entries(selectionObj)) {
    const def = lodashFind(layers, { id: key });
    setStyleFunction(def, def.vectorStyle.id, vectorStyles, null, state, { type, features: featureIdArray });
    if (lastSelection[key]) delete lastSelection[key];
  }
  for (let [key] of Object.entries(lastSelection)) {
    const def = lodashFind(layers, { id: key });
    setStyleFunction(
      def,
      def.vectorStyle.id,
      vectorStyles,
      null,
      state
    );
  }

}