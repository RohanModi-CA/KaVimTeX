local start_server = require('vim_server.start_server')


local KVTRuntimePathArray = vim.api.nvim_get_runtime_file("lua/", true)
local KVTRoot = "" -- after it is found, it will *not* contain a / after KaVimTex, so keep that in mind.





return start_server

