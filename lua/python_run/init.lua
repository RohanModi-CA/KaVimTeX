local lfs = require('lfs')

local pwd = lfs.currentdir()
vim.cmd [[
	let s:plugindir = expand('<sfile>:p:h:h')

]]

pwd = pwd:sub(1,-15) -- there has got to be a better way than this.
pwd = s:plugindir

local webkit_location = pwd .. "backend/viewer/webkit_viewer.py"

print("/usr/bin/env python3 " .. webkit_location)

