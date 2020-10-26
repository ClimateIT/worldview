#!/bin/bash

# This script should be run inside the docker container to start worldview

npm cache verify
npm install --unsafe-perm
npm run build
npm start
