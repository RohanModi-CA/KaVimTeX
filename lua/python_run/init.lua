local lfs = require('lfs')

local pwd = lfs.currentdir()
pwd = pwd:sub(1,-16) -- there has got to be a better way than this.

local webkit_location = pwd + "backend/viewer/webkit_viewer.py"

os.execute("/usr/bin/env python3 " + webkit_location)

