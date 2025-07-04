import Modeler from 'bpmn-js/lib/Modeler';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useService } from 'bpmn-js-properties-panel';

import extHelper from "bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper";



import {
  assign,
  isArray
} from 'min-dash';

import inherits from 'inherits';
import PstnuModule from './pstnu';
import CstnuModule from './cstnu'

import {
  createExtensionElements,
  createCamundaProperties,
  getExtensionElements,
  getExtensionElement,
  getAllExtensionElements,
  getCamundaProperties
} from '../helper/ExtensionHelper';


export default function CustomModeler(options) {
  Modeler.call(this, options);

  this._customElements = [];
  this._removedElements = [];
}

inherits(CustomModeler, Modeler);

// check here for session cookies, if value is pstnu concat one, else the other

const params = new URLSearchParams(window.location.search);
const modelerType = params.get('modeler');

if (modelerType === 'cstnu') {
  // Show cstnu version
  CustomModeler.prototype._modules = [].concat(
    CustomModeler.prototype._modules,
    [
      CstnuModule
    ]
  );
  console.log("c");
} else if (modelerType === 'pstnu') {
  // Show stnu version
  CustomModeler.prototype._modules = [].concat(
    CustomModeler.prototype._modules,
    [
      PstnuModule
    ]
  );
  console.log("p");
}else if(modelerType === 'basic') {

    CustomModeler.prototype._modules;
    console.log("basic");
}



/**
 * Add a single custom element to the underlying diagram
 *
 * @param {Object} customElement
 */
CustomModeler.prototype._addCustomShape = function(customElement) {

  const moddle = this.get('moddle'),
        modeling = this.get('modeling');

  /*

  console.log(customElement);

    let canvas = this.get('canvas'),
    elementFactory = this.get('elementFactory');

  let customAttrs = assign({ businessObject: customElement }, customElement);
  let customShape = elementFactory.create('shape', customAttrs);

  return canvas.addShape(customShape);

  */


  var businessObject = customElement.businessObject;
  var parent = customElement.parent;

  var extensionElements = parent.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
  var index = extensionElements.get('values').findIndex ( x => x.id == businessObject.id );
  if( index === -1 ){
     extensionElements.get('values').push(businessObject);
  }else{
     extensionElements.get('values').splice(index, 1);
     extensionElements.get('values').push(businessObject);
  }

  modeling.updateProperties(parent, {
      extensionElements
    });

};

CustomModeler.prototype._addCustomConnection = function(customElement) {

/*

  let canvas = this.get('canvas'),
    elementFactory = this.get('elementFactory'),
    elementRegistry = this.get('elementRegistry');

  let customAttrs = assign({ businessObject: customElement }, customElement);

  let connection = elementFactory.create('connection', assign(customAttrs, {
    source: elementRegistry.get(customElement.source),
    target: elementRegistry.get(customElement.target)
  }),
    elementRegistry.get(customElement.source).parent);

  // Add the minD and maxD as as label with overlays to the sequenceFlow elements
  //this.updateLabelOverlay(connection);

  return canvas.addConnection(connection);
*/

  const moddle = this.get('moddle'),
        modeling = this.get('modeling');

  var businessObject = customElement.businessObject;
  var parent = customElement.parent;
  var extensionElements = parent.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

 if(typeof businessObject.waypoints != 'string'){
   businessObject.waypoints = JSON.stringify(businessObject.waypoints);
 }

  var index = extensionElements.get('values').findIndex ( x => x.id == businessObject.id );
  if( index === -1 ){
     extensionElements.get('values').push(businessObject);
  }else{
     extensionElements.get('values').splice(index, 1);
     extensionElements.get('values').push(businessObject);
  }

  modeling.updateProperties(parent, {
      extensionElements
    });

};

/**
 * Add a number of custom elements and connections to the underlying diagram.
 *
 * @param {Array<Object>} customElements
 */
CustomModeler.prototype.addCustomElements = function() {

  const moddle = this.get('moddle'),
        modeling = this.get('modeling'),
        elementRegistry = this.get("elementRegistry");

  var customElements = this._customElements;

  var removeElement = this._removedElements;

  var shapes = [],
      connections = [];

  customElements.forEach(function(customElement) {
    if (isCustomConnection(customElement) || isTemporalConstraint(customElement)) {
      connections.push(customElement);
    } else {
      shapes.push(customElement);
    }
  });

  // add shapes before connections so that connections
  // can already rely on the shapes being part of the diagram
  shapes.forEach(this._addCustomShape, this);

  connections.forEach(this._addCustomConnection, this);

};

CustomModeler.prototype.removeCustomElement = function() {

          //console.log(extensionElements.get('values'));

  //console.log(parent);
  //var id = businessObject.id;


  //




};

/**
 * Get custom elements with their current status.
 *
 * @return {Array<Object>} custom elements on the diagram
 */
CustomModeler.prototype.getCustomElements = function() {
  return this._customElements;
};

CustomModeler.prototype.cleanCustomElements = function () {
  this._customElements = [];
};

CustomModeler.prototype.setCustomElements = function (customElements) {
  if (isArray(customElements)) {
    this._customElements = customElements;
  }
  else{
    console.log('Custom Elements must be an array to be set');
  }
};


CustomModeler.prototype.loadCustomElementsFromXML = function () {

  const elementRegistry = this.get('elementRegistry');
  let customElements = [];
  elementRegistry.getAll().forEach(function (element) {
    let businessObject = getBusinessObject(element);
    let extensionElements = businessObject.extensionElements;
    if (extensionElements) {

      // get START NODE element
      let startNodes = getAllExtensionElements(businessObject, 'td:StartNode');
      console.log(startNodes);
      if (startNodes && startNodes.length > 0){
        startNodes.forEach(function (startNode) {
          let customElement = {
            type: 'td:StartNode',
            id: startNode.id,
            x: startNode.x,
            y: startNode.y
          };
          customElements.push(customElement);
        });
        console.log(customElements);
      }

      // get END NODE element
      let endNodes = getAllExtensionElements(businessObject, 'td:EndNode');
      if (endNodes && endNodes.length > 0){
        endNodes.forEach(function (endNode) {
          let customElement = {
            type: 'td:EndNode',
            id: endNode.id,
            x: endNode.x,
            y: endNode.y
          };
          customElements.push(customElement);
        });
      }

      // get CUSTOM CONNECTOR element
      let CustomConnectors = getAllExtensionElements(businessObject, 'td:CustomConnector');
      if (CustomConnectors && CustomConnectors.length > 0){
        CustomConnectors.forEach(function (CustomConnector) {
          let customElement = {
            type: 'td:CustomConnector',
            id: CustomConnector.id,
            waypoints: JSON.parse(CustomConnector.waypoints),
            source: CustomConnector.source,
            target: CustomConnector.target
          };
          customElements.push(customElement);
          console.log("LOOK HERE");
          console.log(customElement);
        });
      }

      // get TEMPORAL CONSTRAINT element
      let TemporalConstraints = getAllExtensionElements(businessObject, 'td:TemporalConstraint');
      if (TemporalConstraints && TemporalConstraints.length > 0 ){
        TemporalConstraints.forEach(function (TemporalConstraint) {
          let customElement = {
            type: 'td:TemporalConstraint',
            id: TemporalConstraint.id,
            value: TemporalConstraint.value,
            constraintType: TemporalConstraint.constraintType,
            waypoints: JSON.parse(TemporalConstraint.waypoints),
            source: TemporalConstraint.source,
            target: TemporalConstraint.target

          };
          customElements.push(customElement);
          console.log("LOOK HERE");

          console.log(customElement);
        });
      }
    }
  });
   console.log(customElements);
   this.setCustomElements(customElements);
   this.addCustomElements();

};

// Funtion to get temporal constraint values from the extension elements
CustomModeler.prototype.getAttributeExtensionElement = function (element, typeName, property) {
  let businessObject = element.businessObject || element;

  let tempConType;

  if (businessObject.$type.includes('Task')) {
    tempConType = "DurationConstraintTask";
  } else if (businessObject.$type.includes('Gateway')) {
    tempConType = "DurationConstraintGateway";
  }

  let extensions = extHelper.getExtensionElements(
    businessObject,
    "td:" + tempConType
  );
  let returnValue;
  if (extensions) {
    if (extensions.length > 0) {
      returnValue = extensions[0][property];
    }
  }
  return returnValue;
};




function isCustomConnection(element) {
  return element.type === 'td:CustomConnector';
}

function isTemporalConstraint(element) {
  return element.type === 'td:TemporalConstraint';
}
