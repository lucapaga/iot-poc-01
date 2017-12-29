#!/bin/bash

cd ../angular-led-mgr

npm run-script build

cd -

rm -rf static
mkdir -p static
cp -r ../angular-led-mgr/dist/* ./static/

gcloud app deploy
