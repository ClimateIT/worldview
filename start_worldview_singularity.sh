#!/bin/bash

rm $HOME/.singularity/instances/logs/irsweb02/nhannah/worldview.err
rm $HOME/.singularity/instances/logs/irsweb02/nhannah/worldview.out

singularity instance start worldview.sif worldview
# FIXME: create worldview.def that makes worldview.sif with correct entrypoint
#singularity exec instance://worldview export PORT=3000 nohup /bin/sh ./tasks/start.sh &
