#!/bin/sh

fuser -k 63001/tcp
fuser -k 63002/tcp
/usr/bin/env python3 $HOME'/.local/share/nvim/plugged/KaVimTex/backend/viewer/webkit_viewer.py' &
node $HOME'/.local/share/nvim/plugged/KaVimTex/backend/process.js' &
