#!/bin/bash

singularity instance start worldview_latest.sif worldview
# FIXME: create worldview.def that makes worldview_latest.sif with correct entrypoint
singularity exec instance://worldview export PORT=9000 nohup /bin/sh ./tasks/start.sh &
