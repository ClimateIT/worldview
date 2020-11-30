#!/bin/bash

# FIXME: needs to be a single command
# FIXME: put pull in herre as well
singularity instance start worldview_latest.sif worldview
singularity shell instance://worldview
export PORT=9000
./tasks/start.sh
