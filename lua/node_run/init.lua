local lfs = require('lfs')

local pwd = lfs.currentdir()
pwd = pwd:sub(1,-13) -- there has got to be a better way than this.

local process_js_location = pwd .. "backend/process.js"

os.execute("node " .. process_js_location)

