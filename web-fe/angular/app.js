/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START app]
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Buffer = require('safe-buffer').Buffer;
const process = require('process'); // Required for mocking environment variables

const uuid = require('uuid-v4');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
// These environment variables are set automatically on Google App Engine
const PubSub = require('@google-cloud/pubsub');
const pubsub = PubSub({
  projectId: "luca-paganelli-formazione"
});

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: "luca-paganelli-formazione"
});
const datastoreKind = 'LedStatus';

const app = express();

//app.set('view engine', 'pug');
//app.set('views', path.join(__dirname, 'views'));

const formBodyParser = bodyParser.urlencoded({ extended: false });
const jsonBodyParser = bodyParser.json();

// List of all messages received by this instance
const messages = [];

// The following environment variables are set by app.yaml when running on GAE,
// but will need to be manually set when running locally.
//const PUBSUB_VERIFICATION_TOKEN = process.env.PUBSUB_VERIFICATION_TOKEN;

const commandTopic = pubsub.topic(process.env.GCP_PUBSUB_TOPIC_COMMANDS);
const commandPublisher = commandTopic.publisher();

app.use(express.static('dist'));
app.use(jsonBodyParser);

app.get('/', (req, res) => {
  //res.render('index', { messages: messages });
  res.status(200).send('Ready to go');
});

app.get('/devices', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var query = datastore.createQuery('IOTDevice');
  datastore.runQuery(query)
    .then((results) => {
      logDebug("Result", results);
      logDebug('' + results[0].length + ' Device(s) found');
      res.status(200).send(JSON.stringify({
        num_devices: results[0].length,
        status: results[0]
      }))
    }).catch((err) => {
      console.error('ERROR getting DEVICES:', err);
      res.status(501).send(JSON.stringify({
        num_devices: 0,
        status: [],
        error: err
      }))
    });
})

app.post('/devices', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var newDeviceKey = datastore.key("IOTDevice");
  logDebug("KEY: ", newDeviceKey);

  var newID = uuid();
  logDebug("UUID: ", newID);

  logDebug("Device NAME: ", req.body.deviceName);
  logDebug("COMMANDS Topic: ", process.env.GCP_PUBSUB_TOPIC_COMMANDS);

  var newDeviceEntity = {
    key: newDeviceKey,
    data: {
      commands_topic: process.env.GCP_PUBSUB_TOPIC_COMMANDS,
      device_id: newID,
      device_name: req.body.deviceName,
      status_topic: "gpio_status_topic"
    }
  };

  datastore.save(newDeviceEntity)
    .then(() => {
      console.log(`Saved '${newDeviceEntity.key.name}': '${newDeviceEntity.key.value}'`);
      res.status(200).send(JSON.stringify({
        status: "OK"
      }));
    })
    .catch((err) => {
      console.error('ERROR:', err);
      res.status(501).send(JSON.stringify({
        status: "",
        error: err
      }))
    });
});

app.get('/devices/:deviceId/outs', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  logDebug("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id);
  datastore.runQuery(query)
    .then((results) => {
      logDebug('' + results[0].length + ' Light statuses found');
      res.status(200).send(JSON.stringify({
        num_lights: results[0].length,
        status: results[0]
      }));
    }).catch((err) => {
      console.error('ERROR:', err);
      res.status(501).send(JSON.stringify({
        num_lights: 0,
        status: [],
        error: err
      }));
    });
})

app.get('/devices/:deviceId/outs/t/:type/c/:color', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  var output_type=req.params["type"];
  var output_color=req.params["color"];
  //logDebug("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id)
                       .filter('light_color', '=', output_color)
                       .filter('light_type', '=', output_type);
  datastore.runQuery(query)
    .then((results) => {
      logDebug('' + results[0].length + ' Light statuses found');
      res.status(200).send(JSON.stringify({
        num_lights: results[0].length,
        status: results[0]
      }))
    }).catch((err) => {
      console.error('ERROR:', err);
      res.status(501).send(JSON.stringify({
        num_lights: 0,
        status: [],
        error: err
      }))
    });
})

app.get('/devices/:deviceId/outs/p/:gpio_pin', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  var gpio_pin=req.params["gpio_pin"];
  //logDebug("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id)
                       .filter('gpio_pin', '=', gpio_pin);
  datastore.runQuery(query)
    .then((results) => {
      logDebug('' + results[0].length + ' Light statuses found');
      res.status(200).send(JSON.stringify({
        num_lights: results[0].length,
        status: results[0]
      }))
    }).catch((err) => {
      console.error('ERROR:', err);
      res.status(501).send(JSON.stringify({
        num_lights: 0,
        status: [],
        error: err
      }))
    });
})

app.post('/devices/:deviceId/outs/all', (req, res) => {
  var led_state=req.body.ledState;
  var device_id=req.params["deviceId"];
  var action="light-"
  var tstamp = getTimestamp();

  logDebug("Operating on DEVICE ID: '" + device_id + "' ...");

  if(led_state == "on") {
    action = action + led_state
  } else if(led_state == "off") {
    action = action + led_state
  } else {
    action = action + "off"
  }
//  logDebug("Moving all Outputs to '" + action + "'")

  logDebug("Working with TOPIC: ", commandTopic);
  logDebug("Working with PUBLISHER: ", commandPublisher);

  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id);
  datastore.runQuery(query)
    .then((results) => {
      if(results[0].length <= 0) {
        logDebug('No outputs found for DEVICE (ID=' + device_id + '). No command.');
        res.status(200).send(JSON.stringify({
          num_commands: 0
        }))
      } else {
        var resultData = results[0];
        logDebug('Commading "' + action + '" to ' + resultData.length +
                  ' OUTPUTS on DEVICE (ID=' + device_id + ')');
        logDebug("RESULTS DATA: ", resultData);
        for (var i = 0; i < resultData.length; i++) {
//        for (var anOutput in results[0]) {
          var anOutput = resultData[i]
//          if (results[0].hasOwnProperty(anOutput)) {
          logDebug("Processing OUTPUT: ", anOutput);
          commandPublisher.publish(
              new Buffer('{"device_id": "' + anOutput.device_id + '", ' +
                          '"led_color": "' + anOutput.light_color + '", ' +
                          '"light_type": "' + anOutput.light_type + '", ' +
                          '"gpio_pin": "' + anOutput.gpio_pin + '", ' +
                          '"action": "' + action + '", '+
                          '"ts": "' + tstamp + '"}')
              , (err, messageId) => {
                if (err) {
                  logWarn("[msg: " + messageId + "] Unable to send message ("+
                                "DEVICE ID='" + anOutput.device_id +
                                "', LIGHT COLOR='" + anOutput.light_color +
                                "', LIGHT TYPE='" + anOutput.light_type +
                                "', GPIO PIN='" + anOutput.gpio_pin +
                                "'): ", err);
                  return;
                }
                logDebug("[msg: " + messageId + "] SUCCESSFULLY SENT");
              });
            logDebug("Message submitted ("+
                          "DEVICE ID='" + anOutput.device_id +
                          "', LIGHT COLOR='" + anOutput.light_color +
                          "', LIGHT TYPE='" + anOutput.light_type +
                          "', GPIO PIN='" + anOutput.gpio_pin +
                          "')");
//          }
        }
        res.status(200).send(JSON.stringify({
          num_lights: resultData.length,
          status: resultData
        }))
      }
    }).catch((err) => {
      console.error('ERROR:', err);
      res.status(501).send(JSON.stringify({
        num_lights: 0,
        status: [],
        error: err
      }))
    });
/*
  commandPublisher.publish(
      new Buffer('{"device_id": "' + device_id + '", ' +
                  '"led_color": "red", ' +
                  '"action": "' + action + '", '+
                  '"ts": "' + tstamp + '"}')
      , (err, messageId) => {
        if (err) {
          console.warn("[msg: " + messageId + "] Unable to send message (RED LED): ", err);
          return;
        }
        logDebug("[msg: " + messageId + "] Message sent: RED LED");
      });

  commandPublisher.publish(
      new Buffer('{"device_id": "' + device_id + '", ' +
                  '"led_color": "green", ' +
                  '"action": "' + action + '", '+
                  '"ts": "' + tstamp + '"}')
      , (err, messageId) => {
        if (err) {
          console.warn("[msg: " + messageId + "] Unable to send message (GREEN LED): ", err);
          return;
        }
        logDebug("[msg: " + messageId + "] Message sent: GREEN LED");
      });

  commandPublisher.publish(
      new Buffer('{"device_id": "' + device_id + '", ' +
                  '"led_color": "light-bulb", ' +
                  '"action": "' + action + '", '+
                  '"ts": "' + tstamp + '"}')
      , (err, messageId) => {
        if (err) {
          console.warn("[msg: " + messageId + "] Unable to send message (LIGHT BULB): ", err);
          return;
        }
        logDebug("[msg: " + messageId + "] Message sent: LIGHT BULB");
      });
*/
  //res.status(200).send('All messages sent');
})


app.post('/devices/:deviceId/outs/p/:gpio_pin', (req, res) => {
  var led_state=req.body.ledState;
  var device_id=req.params["deviceId"];
  var gpio_pin=req.params["gpio_pin"];
  var action="light-";
  var tstamp = getTimestamp();

  logDebug("Operating on DEVICE ID: '" + device_id +
                     "' | GPIO PIN: '" + gpio_pin +
                    "' | TIMESTAMP: '" + tstamp + "'");

  if(led_state == "on") {
    action = action + led_state
  } else if(led_state == "off") {
    action = action + led_state
  } else {
    action = action + "off"
  }
  logDebug("Moving all Outputs to '" + action + "'")

  logDebug("Working with TOPIC: ", commandTopic);
  logDebug("Working with PUBLISHER: ", commandPublisher);

  commandPublisher.publish(
      new Buffer('{"device_id": "' + device_id + '", ' +
                  '"gpio_pin": "' + gpio_pin + '", ' +
                  '"action": "' + action + '", '+
                  '"ts": "' + tstamp + '"}')
      , (err, messageId) => {
        if (err) {
          console.warn("[msgID: " + messageId + "] Unable to send message (RED LED): ", err);
          return;
        }
        logDebug("[msgID: " + messageId + "] Message sent: RED LED");
      });

  res.status(200).send('All messages sent');
})

const logWarn = (message, objectData) => {
  if(WARN_ENABLED && message != null && message != "") {
    if(objectData != null) {
      console.warn(makeMessage(message), objectData);
    } else {
      console.warn(makeMessage(message));
    }
  }
};

const logDebug = (message, objectData) => {
  if(DEBUG_ENABLED && message != null && message != "") {
    if(objectData != null) {
      console.log(makeMessage(message), objectData);
    } else {
      console.log(makeMessage(message));
    }
  }
};

const makeMessage = (message) => {
  return "[" + getTimestamp() + "] -", message;
};

const getTimestamp = (precision) => {
  var hrtime = new Date().getTime();//process.hrtime();
  //console.log("HRTIME: ", hrtime);
  var millisecs = hrtime// ( hrtime[0] * 1000000 + hrtime[1] / 1000 )
  if(precision == "ms") {
    return Math.round(millisecs);
  } else if(precision == "s") {
    return Math.round(millisecs / 1000);
  } else {
    return Math.round(millisecs)
  }
};

// Start the server
const DEBUG_ENABLED = true
const WARN_ENABLED = true
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logDebug(`App listening on port ${PORT}`);
  logDebug('Press Ctrl+C to quit.');
});
// [END app]

module.exports = app;
