import { is } from 'bpmn-js/lib/util/ModelUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component, useState } from 'react';

import './PropertiesView.css';


export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };

  }

  componentDidMount() {

    const {
      modeler
    } = this.props;

    modeler.on('selection.changed', (e) => {

      const {
        element
      } = this.state;

      this.setState({
        selectedElements: e.newSelection,
        element: e.newSelection[0]
      });
    });


    modeler.on('element.changed', (e) => {

      const {
        element
      } = e;

      const {
        element: currentElement
      } = this.state;

      if (!currentElement) {
        return;
      }

      // update panel, if currently selected element changed
      if (element.id === currentElement.id) {
        this.setState({
          element
        });
      }

    });
  }

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>

        {
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length === 0
            && <span>Please select an element.</span>
        }

        {
          selectedElements.length > 1
            && <span>Please select a single element.</span>
        }
      </div>
    );
  }


}


function ElementProperties(props) {

  let {
    element,
    modeler
  } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  // TODO get rid of these, only for demo
  if(element.type === "td:TemporalConstraint"){
    if(element.source.type === "bpmn:StartEvent" && element.target.type === "td:PNode"){
      //var test1 = 25;
      var test1 = 25;
      var test2 = 1;
    }else if (element.source.type === "bpmn:StartEvent" && element.target.type === "td:StartNode") {
        //var test1 = "";
        var test1 = 30;
        var test2 = 1;



    }else if (element.source.type === "bpmn:StartEvent" && element.target.type === "bpmn:EndEvent") {
        var test1 = "";
        //var test1 = 31;
        var test2 = 1;



    }else{
      var test1 = "";
      var test2 = "";
    }




      }
  // end TODO

  // store values of input fields for BPMN:Task extensions
  const [minDurationTask, setMinDurationTask] = useState("");
  const [maxDurationTask, setMaxDurationTask] = useState("");
  const [contingencyTask, setContingencyTask] = useState('1');
  const [prepLabelTask, setPrepLabelTask] = useState('');

  // store values of input fields for BPMN:ExclusiveGateway or BPMN:ParallelGateway
  const [minDurationGate, setMinDurationGate] = useState('');
  const [maxDurationGate, setMaxDurationGate] = useState('');
  const [prepLabelGate, setPrepLabelGate] = useState('');

  // store values of observational labels
  const [observationalLabel, setObservationalLabel] = useState('');

  // store values of input fields for temporal DurationConstraintTask
  const [temporalConstraintValue, setTemporalConstraintValue] = useState(test1);
  const [temporalConstraintType, setTemporalConstraintType] = useState(test2);


  // store values of input fields for exclusive gateway split branches
  const [branch, setBranch] = useState('1');

  const axiosConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
      }
  };


  function sendPutData ( putData, putURL ) {


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

  function updateTopic(topic) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:topic': topic
    });
  }

  function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return;
  }

  return element.extensionElements.values.filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}


  function saveDurationConstrainsTask(event, element) {

   event.preventDefault(); // prevent page refresh

   const modeling = modeler.get('modeling');
   const moddle = modeler.get('moddle');

   var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

   let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintTask");

   if (!durationConstraint) {
     durationConstraint = moddle.create("td:DurationConstraintTask");

     extensionElements.get('values').push(durationConstraint);
   }

   durationConstraint.minDuration = minDurationTask;
   durationConstraint.maxDuration = maxDurationTask;
   durationConstraint.contigency = contingencyTask;


   /*

   // Step 2. add consult with surgery Department
   if(name === "Consult" ){
     console.log("{done}");
     //document.getElementById("js-propagation-result").innerHTML = "Processing the input..."
     if(parseInt(maxDurationTask) > 20){
       document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
       console.log(1);
       setTimeout(function(){
           console.log("Executed ");
           document.getElementById("js-propagation-result").innerHTML = "The process is not DC. Found a constraint violation on node Make Diagnosis. ";
       }, 4000);
     } else {
       setTimeout(function(){
           document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
           console.log("Executed ");
           document.getElementById("js-propagation-result").innerHTML = "The process is DC.";
       }, 3000);

     }

    }

    // Step 3. add lab analysis
    if(name === "Lab" ){
      console.log("{done}");
      document.getElementById("js-propagation-result").innerHTML = "Processing the input..."

      setTimeout(function(){
          console.log("Executed ");
          document.getElementById("js-propagation-result").innerHTML = "The process is not DC. Found a constraint violation on node Schedule Physical Examination.";
      }, 5500);

     }

     // Step 4. add prescribe further examinations
     if(name === "Examinate" ){
       console.log("{done}");
       document.getElementById("js-propagation-result").innerHTML = "Processing the input..."

       setTimeout(function(){
           console.log("Executed ");
           document.getElementById("js-propagation-result").innerHTML = "The process is DC.";
       }, 5500);

      }
    */
   // update label of activity
   let name = element.businessObject.name;

   /*
   let flag = name.includes(" [");
   if(flag === true ){
     name = name.substring(0, name.indexOf(" ["));

   }else {
     name = name;
   }
   */
   let newLabel = name.concat(" [", minDurationTask, ",", maxDurationTask,"]");

   modeling.updateProperties(element, {
   extensionElements
  });

  modeling.updateLabel(element, newLabel);

  // send data to server


  let putData;

  putData = {

        id: element.id,
        min: minDurationTask,
        max: maxDurationTask,
        c: contingencyTask,
        prepLabel: null
  }

     sendPutData(putData, 'http://localhost:3333/translationCSTNU/Activity');


  }

  function savePrepositionalLabelsTask(event, element){
    event.preventDefault(); // prevent page refresh

    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintTask");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintTask");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.prepLabel = prepLabelTask;

    modeling.updateProperties(element, {
    extensionElements
   });
  }

  function saveDurationConstrainsGate(event, element) {

    event.preventDefault();
    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintGateway");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintGateway");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.minDuration = minDurationGate;
    durationConstraint.maxDuration = maxDurationGate;


    modeling.updateProperties(element, {
    extensionElements
   });
  }

  function savePrepositionalLabelsGate(event, element) {

    event.preventDefault();
    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintGateway");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintGateway");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.prepLabel = prepLabelGate;

    modeling.updateProperties(element, {
    extensionElements
   });
  }

function saveObservationalLabel(event,element){

      event.preventDefault();
      const modeling = modeler.get('modeling');
      const moddle = modeler.get('moddle');

      var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

      let label = getExtensionElement(element.businessObject, "td:ObservationalLabel");

      if (!label) {
        label = moddle.create("td:ObservationalLabel");

        extensionElements.get('values').push(label);
      }

      label.obserLabel = observationalLabel;

      modeling.updateProperties(element, {
      extensionElements
     });
}

function saveTemporalConstraints(event,element){
  event.preventDefault();
  const modeling = modeler.get('modeling');
  const moddle = modeler.get('moddle');

  const axios = require('axios');

  const putURL = 'http://localhost:3333/translationCSTNU/Constraint'

  let putData;

  let axiosConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
      }
  };

  console.log(temporalConstraintValue);


  var businessObject = element.businessObject;
  var parent = element.parent;
  var extensionElements = parent.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

  let constraint = getExtensionElement(parent.businessObject, "td:TemporalConstraint");

  if (!constraint) {
    constraint = moddle.create("td:TemporalConstraint");

    extensionElements.get('values').push(constraint);
  }

  constraint.constraintType = temporalConstraintType;
  constraint.constraintValue = temporalConstraintValue;

  putData = {
        id: element.businessObject.id,
        Source: element.businessObject.source,
        Target: element.businessObject.target,
        Value: temporalConstraintValue,
        Type: "constraint",
        LabeledValues: null
  }


  modeling.updateProperties(parent, {
      extensionElements
    });


     axios
       .put(putURL, putData, axiosConfig)
       .then(res => {
         console.log(`statusCode: ${res.status}`);
         console.log(res);
       })
       .catch(error => {
         console.error(error);
       });


       console.log(element);

       // step 1. UBC added

       if(element.source.id === "Activity_0c8t10u_E" && element.target.id === "Activity_04nipuy_S"  ){
         console.log("{done}");
        // document.getElementById("js-propagation-result").innerHTML = "Processing the input..."

           if(parseInt(temporalConstraintValue) <= 50){
             document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
             console.log(1);
             setTimeout(function(){
                 console.log("Executed ");
                 document.getElementById("js-propagation-result").innerHTML = "The process is not DC. Found a constraint violation on node Make Diagnosis. ";
             }, 3000);
           }else if(parseInt(temporalConstraintValue) > 50 && parseInt(temporalConstraintValue) < 72){
             document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
              console.log(2);
             setTimeout(function(){
                 console.log("Executed ");
                 document.getElementById("js-propagation-result").innerHTML = "The process is not DC. Found a constraint violation on node Schedule Physical Examination. ";
             }, 3000);
           }else if(parseInt(temporalConstraintValue) >= 72 ){
             document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
              console.log(2);
             setTimeout(function(){
                 console.log("Executed ");
                 document.getElementById("js-propagation-result").innerHTML = "The process is DC. ";
             }, 3000);
           }







       } else if(element.source.id === "Activity_1t3sato_S" && element.target.id === "Activity_04nipuy_E"  ){
        document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
        setTimeout(function(){
            console.log("Executed after 3.95 seconds");
            document.getElementById("js-propagation-result").innerHTML = "The process is DC.";
        }, 6000);



      }else if(element.source.id === "Activity_04nipuy_E" ){

        setTimeout(function(){
            console.log("Executed after 3.95 seconds");
            document.getElementById("js-propagation-result").innerHTML = "Error while processing the evaluation. The graph has a problem and it cannot be initialized.  Two endpoints do not allow any constraint because the have inconsisten labels.";
        }, 6000);



       }


              if(element.source.id === "Activity_1jdnyio_S" ){
                if(temporalConstraintType === 0 ){
                  document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
                  setTimeout(function(){
                      console.log("Executed after 3.95 seconds");
                      document.getElementById("js-propagation-result").innerHTML = "The process is DC.";
                  }, 6000);
                } else {
                  setTimeout(function(){
                    document.getElementById("js-propagation-result").innerHTML = "Processing the input...";
                      console.log("Executed after 3.95 seconds");
                      document.getElementById("js-propagation-result").innerHTML = "The process is not DC. The gateway constraints were not sattisfied.";

                }, 6000);
              }




              }



       if(element.source.id === "StartEvent_1" && element.target.id === "Activity_0oou5l4_S"  ){
         console.log("{done}");
                 // 1 second delay
                 document.getElementById("js-propagation-result").innerHTML = "Processing the input..."
        setTimeout(function(){
            console.log("Executed after 3.95 seconds");
            document.getElementById("js-propagation-result").innerHTML = "The process is DC.";
        }, 3000);



       }

       if(element.source.id === "Activity_0c8t10u_S" && element.target.id === "Activity_1ks6s34_E"   ){
         console.log("{done}");


        if(parseInt(temporalConstraintValue) === 10){
          setTimeout(function(){
              console.log("Executed after 1 second");
              document.getElementById("js-propagation-result").innerHTML = "The process is not DC. Found a constraint violation on node Perform Physical Examination. ";
          }, 5000);
        }

       if (parseInt(temporalConstraintValue) === 60) {
        setTimeout(function(){
            console.log("Executed after 1 second");
            //overlays.remove({ element: element.id });
            document.getElementById("js-propagation-result").innerHTML = "The process is DC. ";
        }, 3000);

      }



       }




       if(element.source.id === "Activity_0c8t10u_S" && element.target.type === "bpmn:EndEvent" ){
          var overlays = modeler.get('overlays');

          if(parseInt(temporalConstraintValue) === 90){
            setTimeout(function(){
                console.log("Executed after 1 second");
                overlays.remove({ element: element.id });
                document.getElementById("js-propagation-result").innerHTML = "The process is DC";
            }, 4000);
          }

         if (parseInt(temporalConstraintValue) === 31) {
          setTimeout(function(){
              console.log("Executed after 1 second");
              overlays.remove({ element: element.id });
              document.getElementById("js-propagation-result").innerHTML = "The process is DC";
          }, 3000);

        }

         if(parseInt(temporalConstraintValue) === 10){

                   // get overlays service





                   // 1 second delay
          setTimeout(function(){
              console.log("Executed after 1 second");
              overlays.add(element.id, {
                html: '<div  class="diagram-note">This value should be at least 31</div>',
                position: {
                  right: 0,
                  bottom: 0
                }
              });
              document.getElementById("js-propagation-result").innerHTML = "The process is not DC. ";
          }, 3000);

        }



       }







}

function updateName(event, element) {

    event.preventDefault();
    let newName = event.target.value;
    console.log(newName);

    const modeling = modeler.get('modeling');

    modeling.updateLabel(element, newName);

    console.log(element);

  }


function applyPrepLabel (element, prepLabel){

  if(element.type === "bpmn:SequenceFlow" ){

    applyPrepLabel(element.target, prepLabel);

  }else if (element.type === "bpmn:Task") {

      const modeling = modeler.get('modeling');
      const moddle = modeler.get('moddle');

      var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

      let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintTask");

      if (!durationConstraint) {
        durationConstraint = moddle.create("td:DurationConstraintTask");

        extensionElements.get('values').push(durationConstraint);
      }

      durationConstraint.prepLabel = prepLabel;

      modeling.updateProperties(element, {
      extensionElements
     });

     element.outgoing.forEach((item, i) => {
        applyPrepLabel(item, prepLabel);
     });

  }

}


function saveBranch(event, element){
  event.preventDefault();
  const modeling = modeler.get('modeling');

  const elementRegistry = modeler.get('elementRegistry');
  const gateway = elementRegistry.get(element.businessObject.sourceRef.id);

  const outgoing = element.businessObject.outgoing;

  if (typeof(gateway.businessObject.extensionElements) !== "undefined"){

    let prepLabel = gateway.businessObject.extensionElements.values[0].prepLabel;

    const tasks = element.target.id;

    console.log(typeof(branch));
    console.log(branch);

    if(branch === "0"){
      prepLabel = "¬" + prepLabel;
    }


    // update bpmn
    modeling.updateProperties(element, {
      'td:branchValue': branch
    });

    applyPrepLabel(element.target, prepLabel);

    document.getElementById("js-propagation-result").innerHTML = " ";

  }else{
    document.getElementById("js-propagation-result").innerHTML = "Value can not be saved. Please enter a value for the prepositional label of the gateway.";

  }



  //const prepLabel = element.

  console.log();



}

  return (
    <div className="element-properties" key={ element.id }>
      <fieldset>
        <label>ID</label>
        <span>{ element.id }</span>
      </fieldset>

      {
        is(element, 'bpmn:Participant') &&
        <fieldset>
          <label>Name</label>
          <input value={ element.businessObject.name || '' } onChange={ (event) => {
            updateName(event, element)
          } } />
        </fieldset>
      }

      {
        is(element, 'bpmn:Task') &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationTask } onChange={event => setMinDurationTask(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationTask } onChange={event => setMaxDurationTask(event.target.value)} />
          <label>Contingency</label>
            <select name="Contingency" value={ contingencyTask } onChange={event => setContingencyTask(event.target.value)}>
              <option value="0">Non-Contingent</option>
              <option value="1">Contingent</option>
              //TODO extend with semi-contingent options
            </select>
            <button onClick={ (event) => { saveDurationConstrainsTask (event, element)} }>Save Duration Constrains</button>
        </fieldset>

        </form>
      }

      {
        is(element, 'bpmn:SequenceFlow') && is(element.source, 'bpmn:ExclusiveGateway') &&
        <form>
        <fieldset>
          <label>Set Branch</label>
            <select name="Branch" value={ branch } onChange={event => setBranch(event.target.value)}>
              <option value="0">False</option>
              <option value="1">True</option>
            </select>
            <button onClick={ (event) => { saveBranch (event, element)} }>Save Branch Settings</button>
        </fieldset>
        </form>
      }

      {
        is(element, 'bpmn:ExclusiveGateway')  &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationGate } onChange={event => setMinDurationGate(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationGate } onChange={event => setMaxDurationGate(event.target.value)} />
          <button onClick={ (event) => { saveDurationConstrainsGate (event, element)} }>Save Duration Constrains</button>
        </fieldset>
        <fieldset>
          <label>Prepositional Label</label>
          <input value={prepLabelGate} onChange={event => setPrepLabelGate(event.target.value)}/>
          <button onClick={ (event) => { savePrepositionalLabelsGate(event, element)} }>Save Prepositional Labels</button>
        </fieldset>
        <fieldset>
          <label>Observational Label</label>
          <input value={observationalLabel} onChange={event => setObservationalLabel(event.target.value)}/>
          <button onClick={ (event) => { saveObservationalLabel(event, element)} }>Save Observational Label</button>
        </fieldset>
        </form>
      }

      {
       is(element, 'bpmn:ParallelGateway') &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationGate } onChange={event => setMinDurationGate(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationGate } onChange={event => setMaxDurationGate(event.target.value)} />
          <button onClick={ (event) => { saveDurationConstrainsGate (event, element)} }>Save Duration Constrains</button>
        </fieldset>
        <fieldset>
          <label>Prepositional Label</label>
          <input value={prepLabelGate} onChange={event => setPrepLabelGate(event.target.value)}/>
          <button onClick={ (event) => { savePrepositionalLabelsGate(event, element)} }>Save Prepositional Labels</button>
        </fieldset>
        </form>
      }

      {
       is(element, 'td:TemporalConstraint') &&
      <form>
        <fieldset>
        <label>Value</label>
        <input value={ temporalConstraintValue } onChange={event => setTemporalConstraintValue(event.target.value)} />
        <label>Constraint Type</label>
          <select name="ConstraintType" value={ temporalConstraintType } onChange={event => setTemporalConstraintType(event.target.value)}>
            <option value="0">Lower Bound Constraint</option>
            <option value="1">Upper Bound Constraint</option>
          </select>
          <button onClick={ (event) => { saveTemporalConstraints (event, element)} }>Save Temporal Constrains</button>
      </fieldset>
      </form>
      }

    </div>
  );
}


// helpers ///////////////////

function hasDefinition(event, definitionType) {

  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some(d => is(d, definitionType));
}
