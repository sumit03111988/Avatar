
'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
const mysql = require('mysql');
const fs = require('fs');

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
//var myModule=require('./public/js/api');
//console.log(myModule.inputtext1);
// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  // url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: Conversation.VERSION_DATE_2017_04_21
});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
	//console.log('params: ' + JSON.stringify(req.params));
	//console.log('body: ' + JSON.stringify(req.body));
	//console.log('bodyLength: ' + JSON.stringify(req.body).length);
	//console.log('query: ' + JSON.stringify(req.query));
   if(JSON.stringify(req.body).length>2){
   var a = JSON.stringify(req.body.input.text).replace(/\"/g, "");
   }
   else {
	   
	   var a ="hello" ;
   }
   //console.log("ok"+ a);
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };
  
  const connection = mysql.createConnection(  
    {
        host: 'sl-aus-syd-1-portal.2.dblayer.com',
        port: 17099,
        user: 'admin',
        password: 'VRIXEQIHFTURGYYN',
        ssl: {
            ca: fs.readFileSync(__dirname + '/cert.crt')
        }
});

var util = require('util');
var mySql = util.format('insert into FAQ.tbl_FAQ (question) values ("%s")', a);

connection.query(mySql, (err, rows) => {  
    if (err) throw err;
    console.log('Inserted');
	//console.log("test"+req.body.value);
	//console.log("test"+req.query.textInput);
	//console.log("test6"+req.body.textinputnew);
    for (let i = 0, len = rows.length; i < len; i++) {
        console.log(rows[i]['Database'])
		//console.log("test"+req.body.textInput)
    }
});

    
  // Send the input to the conversation service
   conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
	//console.log(payload.params + "message");
    return res.json(updateMessage(payload, data));
	
    
	
  });
});



/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  //console.log("test10"+response.output.text);
  //console.log('body10: ' + JSON.stringify(input.body));

  
  //console.log("test11"+input.params.toString());
  var responseText = null;
  if (!response.output) {
    response.output = "Hey!Sorry I am not fully trained as of now ";
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
    //console.log(response.output.text);
   

  return response;
  
  
}

module.exports = app;
