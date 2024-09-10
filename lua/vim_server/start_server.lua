local kvt = {}

local socket = require('socket')

local KVTRuntimePathArray = vim.api.nvim_get_runtime_file("lua/", true)
local KVTRoot = "" -- after it is found, it will *not* contain a / after KaVimTex, so keep that in mind.
local FILENAME = vim.api.nvim_buf_get_name(0)


local KVTpdf_dir = ""
if vim.g.KVTpdf_dir then
	KVTpdf_dir=vim.g.KVTpdf_dir
end

vim.g.KVTPreviouslyViewedLine = nil

local function get_free_port()
	local server = socket.tcp()
  	server:setoption("reuseaddr", true) -- Allow reusing the address
  	server:bind("*", 0) -- Bind to any address, port 0
  	local _, port = server:getsockname()
  	server:close() -- Close the temporary server
  	return port
end

local port1 = get_free_port()
local port2 = get_free_port()



local HOST = "127.0.0.1"
local WEBKIT_PORT = port1
local PROCESS_PORT = port2


local client

-- check newcommands:
local newcommands = require('command_aliasing')
--


function kvt.connect()
	client = socket.connect(HOST, PROCESS_PORT)

	if client then
		 print("KVT Started")
	else
		 print(KVTRoot.." "..WEBKIT_PORT .. "  " .. PROCESS_PORT.. "  " .. "Failed to connect to the JS Process")
	end
end

function kvt.send_data(data)
	if client then
		client:send(data .. "\n")
	else
		-- print("Not connected to JavaScript process")
	end
end

function kvt.receive_data(data)
	if client then
		local data,err = client:receive("*l")
		if data then
			return data
		else
			--print("Error receiving data: ", err)
		end
	else
		print("Not Connected to JS Process")
	end
end


function kvt.process_current_line()
	local current_line = vim.fn.getline('.')
	current_line = vim.api.nvim_win_get_cursor(0)[1] .. "KVTCURRENTLINE" .. current_line
	kvt.send_data(current_line)
end

vim.api.nvim_create_autocmd({"TextChangedI"},{
	pattern = "*.tex",
	callback = function()
		kvt.process_current_line()
	end,
})


vim.api.nvim_create_autocmd({"CursorMoved"}, {
	pattern = "*.tex",
	callback = function()
	local current_line =  vim.api.nvim_win_get_cursor(0)[1] 


	-- Only process if the line actually changed
	if vim.g.KVTPreviouslyViewedLine ~= current_line then 
		kvt.process_current_line()
	else
		kvt.process_current_line()
	end
	

	vim.g.KVTPreviouslyViewedLine = current_line

end,
})



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
		local cmd = {interpreter, script_path, KVTRoot, WEBKIT_PORT, PROCESS_PORT, FILENAME, KVTpdf_dir }
		vim.fn.jobstart(cmd, {detach = true})
	else
    	print("File not found: " .. script_path)
	end
end


-- Run the scripts.

vim.defer_fn(function()
	run_script("python3", KVTRoot .. "/backend/viewer/webkit_viewer.py", FILENAME)
end, 0)

vim.defer_fn(function()
	run_script("node", KVTRoot .. "/backend/process.js", FILENAME)
end, 0)



vim.defer_fn(function() 
	kvt.connect() 
end, 400) -- Delay for 400 milliseconds. This could lead to a race condition where it does not connect, but I haven't noticed any in practice. And if it doesn't connect, oh well. Try again.


return kvt
