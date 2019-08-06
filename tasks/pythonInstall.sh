#!/bin/bash
# Install python dependencies
if [ $1 = "linux" ]; then
  if command -v python3 &>/dev/null; then
    echo "Installing virtualenv with python3"
    python3 -m pip install --user virtualenv
    python3 -m virtualenv .python
    # If is a linux machine try to run python2
  elif command -v python2 &>/dev/null; then
    echo "Installing virtualenv with python2"
    python2 -m pip install --user virtualenv
    python2 -m virtualenv .python
  else
    echo "Installing virtualenv with python"
    python -m pip install --user virtualenv
    python -m virtualenv .python
  fi
  PATH=.python/bin:${PATH} pip install -r requirements.txt
else
  # If is a window machine use virtualenv
  virtualenv .python
  PATH=.python/Scripts:${PATH} pip install -r requirements.txt
fi



