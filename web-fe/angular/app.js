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
const pubsub = PubSub();

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

const topic = pubsub.topic(process.env.GCP_PUBSUB_TOPIC_COMMANDS);

app.use(express.static('dist'))

app.get('/', (req, res) => {
  //res.render('index', { messages: messages });
  res.status(200).send('Ready to go');
});

app.get('/devices', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var query = datastore.createQuery('IOTDevice');
  datastore.runQuery(query)
    .then((results) => {
      console.log("Result", results);
      console.log('' + results[0].length + ' Device(s) found');
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

app.get('/devices/:deviceId/lights', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  console.log("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id);
  datastore.runQuery(query)
    .then((results) => {
      console.log('' + results[0].length + ' Light statuses found');
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

app.get('/devices/:deviceId/lights/t/:type/c/:color', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  var output_type=req.params["type"];
  var output_color=req.params["color"];
  //console.log("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id)
                       .filter('light_color', '=', output_color)
                       .filter('light_type', '=', output_type);
  datastore.runQuery(query)
    .then((results) => {
      console.log('' + results[0].length + ' Light statuses found');
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

app.get('/devices/:deviceId/lights/p/:gpio_pin', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var device_id=req.params["deviceId"];
  var gpio_pin=req.params["gpio_pin"];
  //console.log("Retrieving status of lights for device '" + device_id + "'");
  var query = datastore.createQuery('IOTDeviceOutput')
                       .filter('device_id', '=', device_id)
                       .filter('gpio_pin', '=', gpio_pin);
  datastore.runQuery(query)
    .then((results) => {
      console.log('' + results[0].length + ' Light statuses found');
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

app.get('/devices/:deviceId/lights/all/:ledState', (req, res) => {
  var led_state=req.params["ledState"];
  var device_id=req.params["deviceId"];
  var action="light-"

  console.log("Operating on DEVICE ID: '" + device_id + "' ...");

  if(led_state == "on") {
    action = action + led_state
  } else if(led_state == "off") {
    action = action + led_state
  } else {
    action = action + "off"
  }
  console.log("Moving all LEDs/Bulbs to '" + action + "'")

  topic.publish({
      data: '{"led_color":"red","action":"' + action + '"}'
    }, (err) => {
      if (err) {
        console.warn("Unable to send message (RED LED): ", err);
        return;
      }
      console.log("Message sent: RED LED");
    });
  topic.publish({
      data: '{"led_color":"green","action":"' + action + '"}'
    }, (err) => {
      if (err) {
        console.warn("Unable to send message (GREEN LED): ", err);
        return;
      }
      console.log("Message sent: GREEN LED");
    });
  topic.publish({
      data: '{"led_color":"light-bulb","action":"' + action + '"}'
    }, (err) => {
      if (err) {
        console.warn("Unable to send message (LIGHT BULB): ", err);
        return;
      }
      console.log("Message sent: LIGHT BULB");
    });

  res.status(200).send('All messages sent');
})


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]

module.exports = app;
