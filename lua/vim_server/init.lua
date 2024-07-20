local start_server = require('vim_server.start_server')


local job_id = vim.fn.jobstart('/home/rohan/.local/share/nvim/plugged/KaVimTex/lua/start.sh', {
  detach = true,  -- Run in the background
  on_stdout = function(_, data)
    -- Handle stdout if needed, otherwise leave empty
  end,
  on_stderr = function(_, data)
    -- Handle stderr if needed, otherwise leave empty
  end
})

-- You can use job_id to interact with the running job




return start_server

