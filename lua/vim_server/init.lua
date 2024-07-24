local start_server = require('vim_server.start_server')


local KVTRuntimePathArray = vim.api.nvim_get_runtime_file("lua/", true)
local KVTRoot = "" -- after it is found, it will *not* contain a / after KaVimTex, so keep that in mind.

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




local function run_script(interpreter, script_path)
  if vim.fn.filereadable(script_path) == 1 then
    local cmd = {interpreter, script_path, KVTRoot}
    vim.fn.jobstart(cmd, {detach = true})
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

