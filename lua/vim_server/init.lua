local start_server = require('vim_server.start_server')


local KVTRuntimePathArray = vim.api.nvim_get_runtime_file("lua/", true)
local KVTRoot = "" -- after it is found, it will *not* contain a / after KaVimTex, so keep that in mind.

local WEBKIT_PORT = 63001
local PROCESS_PORT = 63002



for _, str in ipairs(KVTRuntimePathArray) do
	if str then
		local lowerStr = string.lower(str)
		local startIdx, endIdx = string.find(lowerStr, "kavimtex")
		if startIdx then
			KVTRoot = string.sub(str, 1, endIdx)
			break
		end
	end
end


local function handle_output(job_id, data, event)
	file = io.open(KVTRoot .. "/backend/resources/consoleoutput.txt","a")
	file:write(data .. "\n\n\n")
	file:close()
end

local function run_script(interpreter, script_path)
  if vim.fn.filereadable(script_path) == 1 then
    local cmd = {interpreter, script_path, KVTRoot, WEBKIT_PORT, PROCESS_PORT }
    vim.fn.jobstart(cmd, {detach = true, on_stdout = handle_output, on_stderr = handle_output})
  else
    print("File not found: " .. script_path)
  end
end


-- Run the scripts.

vim.defer_fn(function()
  run_script("python3", KVTRoot .. "/backend/viewer/webkit_viewer.py")
end, 0)

vim.defer_fn(function()
  run_script("node", KVTRoot .. "/backend/process.js")
end, 0)









return start_server

