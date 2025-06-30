import CustomModeler from './custom-modeler';

import PropertiesPanel from './properties-panel';

import customModdleExtension from './moddle/custom.json';

import tdModdleExtension from './moddle/td.json';

import diagramXML from './newDiagram.bpmn';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import CSTNUCommandInterceptor from "./command-interceptor/CSTNUCommandInterceptor";

import $ from 'jquery';

import {
  debounce
} from 'min-dash';

const HIGH_PRIORITY = 1500;

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');


  // app.js

  // Function to reload with a new query parameter
  function reloadWithQueryParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.location.href = url.toString(); // Triggers a full page reload
  }

  // Add event listener to the button
  document.getElementById('cstnuBtn').addEventListener('click', () => {
    reloadWithQueryParam('modeler', 'cstnu');
  });

  // Add event listener to the button
  document.getElementById('pstnuBtn').addEventListener('click', () => {
    reloadWithQueryParam('modeler', 'pstnu');
  });

  // Add event listener to the button
  document.getElementById('basicBtn').addEventListener('click', () => {
    reloadWithQueryParam('modeler', 'basic');
  });




const modeler = new CustomModeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension,
    td:tdModdleExtension
  },
  keyboard: {
    bindTo: document.body
  },
  additionalModules: [CSTNUCommandInterceptor]
});

const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

//modeler.importXML(diagramXML);



// import XML
modeler.importXML(diagramXML, (err) => {
  if (err) {
    console.error(err);
  }

  //modeler.cleanCustomElements();
//  modeler.loadCustomElementsFromXML();

  const moddle = modeler.get('moddle'),
        modeling = modeler.get('modeling');

  const elementRegistry = modeler.get('elementRegistry');



  const params = new URLSearchParams(window.location.search);
  const modelerType = params.get('modeler');
  console.log(modelerType);

  // send data if modeler type cstnu or pstnu, do nothing if modeler if type basic
  // data will be translated and checked in backend
  if (modelerType === 'cstnu' || modelerType === 'pstnu'){



    // prepare for REST Api
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }
    };

    // functions to get the data which will be sent
    const connectionTypes = ["bpmn:SequenceFlow"];

    const getCreatePostDataShape = ( shape ) => {

      const { id } = shape;

      const { type } = shape;

      const { x } = shape;

      const { y } = shape;

      let postData;

      postData = {

            id: id,
            Obs: null,
            Label: null,
            x: x,
            y: y,
            c: 1
      }

      return postData;

    };

    const getCreatePutDataShape = ( shape ) => {

      const { id } = shape;

      const min = shape.businessObject.extensionElements.values[0].minDuration;

      const max = shape.businessObject.extensionElements.values[0].maxDuration;

      const c = shape.businessObject.extensionElements.values[0].contigency;

      let putData;

      putData = {

            id: id,
            min: min,
            max: max,
            c: 1,
            prepLabel: null
      }

      return putData;

    };



    const getCreatePostDataConnection = (connection) => {

      const { id } = connection;

      const { type } = connection;

      const { source } = connection;

      const { target } = connection;

      let postData;

     if(connectionTypes.indexOf(type) !== -1){
       postData = {
           id: id,
           source: source.id,
           target: target.id,
           value: 0,
           type: "normal"
           //LabeledValues: {}

       }
     }

      return postData;

    };

    var baseURL = "http://localhost:9090";
    var url;

    if(modelerType === "cstnu"){

       url = baseURL + "/cstnu/translation/";

    }else if(modelerType === "pstnu"){

       url = baseURL + "/pstnu/translation/";

    }



    const sendPostData = ( postData, postURL ) => {
      const axios = require('axios');

       axios
         .post(postURL, postData, axiosConfig)
         .then(res => {
           console.log(`statusCode: ${res.status}`);
           console.log(res);
         })
         .catch(error => {
           console.error(error);
         });

    };

    const sendPutData = ( putData, putURL ) => {
      const axios = require('axios');

       axios
         .put(putURL, putData, axiosConfig)
         .then(res => {
           console.log(`statusCode: ${res.status}`);
           console.log(res);
         })
         .catch(error => {
           console.error(error);
         });

    };

    const sendSaveData = ( getURL ) => {
      const axios = require('axios');

       axios
         .get(getURL, axiosConfig)
         .then(res => {
           console.log(`statusCode: ${res.status}`);
           console.log(res);
         })
         .catch(error => {
           console.error(error);
         });

    };


    var startEvent = elementRegistry.filter(function(element) {
      return is(element, 'bpmn:StartEvent');
    });

    startEvent.forEach((element, e) => {
      const postData = getCreatePostDataShape(element);
      sendPostData(postData, url + 'Start');
    });


    var endEvent = elementRegistry.filter(function(element) {
      return is(element, "bpmn:EndEvent");
    });

    endEvent.forEach((element, e) => {
      const postData = getCreatePostDataShape(element);
      sendPostData(postData, url + 'End');
    });


    var tasks = elementRegistry.filter(function(element) {
      return is(element, 'bpmn:Task');
    });

    tasks.forEach((element, e) => {

      const postData = getCreatePostDataShape(element);
      sendPostData(postData, url + 'Activity');
      //console.log(element.businessObject.extensionElements.values[0].minDuration);
      const putData = getCreatePutDataShape(element);
      sendPutData(putData, url + 'Activity')
    });
      /*.then((value) => {
      tasks.forEach((element, e) => {
      const putData = getCreatePutDataShape(element);
      sendPutData(putData, 'http://localhost:3333/translationCSTNU/Activity')
      });


    });
    */


    //console.log(tasks);

    var sequenceFlows = elementRegistry.filter(function(element) {
      return is(element, "bpmn:SequenceFlow");
    });

    sequenceFlows.forEach((element, e) => {
      const postData = getCreatePostDataConnection(element);
      sendPostData(postData, url + 'SequenceFlow');
    });

    setTimeout(sendSaveData(url + 'Save'),2000);







  }


});






// bootstrap diagram functions

$(function() {

/*
  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
*/
  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');
  var downloadJsonLink = $('#js-download-json');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(async function() {

    modeler.addCustomElements();
    modeler.removeCustomElement();

    try {

      const { svg } = await modeler.saveSVG();

      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving SVG: ', err);

      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {

      const { xml } = await modeler.saveXML({ format: true });

      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadLink, 'diagram.bpmn', null);
    }

    try {

      const { xml } = await modeler.saveXML({ format: true });

      var xml2js = require('xml2js');
      var parseString = require('xml2js').parseString;
      parseString(xml, function (err, result) {
        var json = JSON.stringify(result);
        setEncoded(downloadJsonLink, 'diagram.json', json);

      });

    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadJsonLink, 'diagram.json', null);
    }
  }, 500);


    modeler.on('commandStack.changed', exportArtifacts);





});
