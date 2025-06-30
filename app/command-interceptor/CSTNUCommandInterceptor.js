import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

class CSTNUCommandInterceptor extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    const activityTypes = ["bpmn:Task", "bpmn:SendTask",
                           "bpmn:ReceiveTask", "bpmn:UserTask", "bpmn:ManualTask",
                           "bpmn:BusinessRuleTask", "bpmn:ServiceTask"];

    const startEventTypes = ["bpmn:StartEvent"];

    const endEventTypes = ["bpmn:EndEvent"];

    const exclusiveTypes = ["bpmn:ExclusiveGateway"];

    const connectionTypes = ["bpmn:SequenceFlow"];

    const constraintTypes = ["td:TemporalConstraint"];

    const parallelTypes = ["bpmn:parallelGateway"];

    this.baseUrl = "http://localhost:9090/cstnu/translation/";


    let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Method": "POST, GET, PUT"
        }
    };

    //const postURL = 'https://localhost:3333/translationCSTNU';

    const params = new URLSearchParams(window.location.search);
    const modelerType = params.get('modeler');
    console.log(modelerType);
    if(modelerType === 'cstnu' || modelerType === 'pstnu'){

      this.getCreatePostDataShape = ( context ) => {

        console.log(context);

        const { shape } = context;

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

      this.getCreatePostDataConnection = (context) => {

        const { connection } = context;

        const { id } = connection;

        const { type } = connection;

        const { source } = context;

        const { target } = context;

        let postData;

       if(connectionTypes.indexOf(type) !== -1){
         postData = {
             id: id,
             source: source.id,
             target: target.id,
             value: 0,
             type: "normal",
             LabeledValues: {}

         }
       }

       if(constraintTypes.indexOf(type) !== -1){

         console.log(context);


         postData = {
             id: id,
             Source: source.id,
             Target: target.id,
             Value: 0,
             Type: "normal",
             LabeledValues: "{(0, ?)}"

         }

       }

        return postData;

      };

      this.sendPostData = ( postData, postURL ) => {
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

      this.updateIds = (context) => {
        console.log (context);
        if(context.source.type === "td:StartNode"){
          let id = context.source.id;
          if(context.target.type !== "td:EndNode"){
            let newId = context.target.id.concat('_S');
            modeling.updateProperties(context.source, {
              id: newId
            });
          }
        }

        if(context.source.type === "td:EndNode"){
          let id = context.source.id;
          if(context.target.type !== "td:StartNode"){
            let newId = context.target.id.concat('_E');
            modeling.updateProperties(context.source, {
              id: newId
            });
          }
        }

        if(context.target.type === "td:StartNode"){
          let id = context.target.id;
          if(context.source.type !== "td:EndNode"){
            let newId = context.source.id.concat('_S');
            modeling.updateProperties(context.target, {
              id: newId
            });
          }
        }

        if(context.target.type === "td:EndNode"){
          let id = context.target.id;
          if(context.source.type !== "td:StartNode"){
            let newId = context.source.id.concat('_E');
            modeling.updateProperties(context.target, {
              id: newId
            });
          }
        }
      };

      // begin sending data


      this.postExecuted(["shape.create"], ({ context }) => {

        const { shape } = context;

        const { type } = shape;

        const postData = this.getCreatePostDataShape(context);

        if(activityTypes.includes(type)){

            this.sendPostData(postData, this.baseUrl + 'Activity');
            console.log(postData);


        }

        if(startEventTypes.includes(type)){

            this.sendPostData(postData, this.baseUrl + 'Start');
            console.log(postData);


        }

        if(endEventTypes.includes(type)){

            this.sendPostData(postData, this.baseUrl + 'End');
            console.log(postData);


        }

        if(exclusiveTypes.includes(type)){

            this.sendPostData(postData, this.baseUrl + 'XOR');
            console.log(postData);


        }

        if(parallelTypes.includes(type)){

          this.sendPostData(postData, this.baseUrl + 'AND');
          console.log(postData);


        }

        //this.sendPostData(postData,postURL);

      });

      this.postExecuted(["shape.delete"], ({ context }) => {

        const { shape } = context;

        const { id } = shape;

        //modeling.updateLabel(shape, id);
        console.log("DELETED");
        console.log(id);
      });

      this.postExecuted(["connection.create"], ({ context }) => {

        if(context.connection.type === "td:CustomConnector"){

          //this.updateIds(context);

        }

       const postData = this.getCreatePostDataConnection(context);
       console.log(postData);
       concole.log(context);

       if(context.connection.type === "bpmn:SequenceFlow"){

         this.sendPostData(postData, this.baseUrl + 'SequenceFlow');
         concole.log("sent data for sequence flow");

       }
       //




       if(context.connection.type === "td:TemporalConstraint"){

         this.sendPostData(postData, this.baseUrl + 'Constraint');

       }

      });

      this.postExecuted(["connection.reconnect"], ({ context }) => {


        //modeling.updateLabel(shape, id);
        console.log("RECONNECT");
      });

    }





  }
}

CSTNUCommandInterceptor.$inject = ["eventBus", "modeling"];

export default {
  __init__: ["CSTNUCommandInterceptor"],
  CSTNUCommandInterceptor: ["type", CSTNUCommandInterceptor]
};
