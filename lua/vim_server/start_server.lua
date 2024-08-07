local llvp = {}

local socket = require('socket')

local RunOnAllFileTypes = not (vim.g.KVTRunOnAllFileTypes==nil)
local KVTRuntimePathArray = vim.api.nvim_get_runtime_file("lua/", true)
local KVTRoot = "" -- after it is found, it will *not* contain a / after KaVimTex, so keep that in mind.


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


function llvp.connect()
	client = socket.connect(HOST, PROCESS_PORT)

	if client then
		 print("Connected to the JS Process")
	else
		 print(KVTRoot.." "..WEBKIT_PORT .. "  " .. PROCESS_PORT.. "  " .. "Failed to connect to the JS Process")
	end
end

function llvp.send_data(data)
	if client then
		client:send(data .. "\n")
	else
		-- print("Not connected to JavaScript process")
	end
end

function llvp.receive_data(data)
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


function llvp.process_current_line()
	local current_line = vim.fn.getline('.')
	llvp.send_data(current_line)
end

vim.api.nvim_create_autocmd({"TextChangedI"},{
	pattern = "*.tex",
	callback = function()
		llvp.process_current_line()
	end,
})

if RunOnAllFileTypes then
	vim.api.nvim_create_autocmd({"CursorMoved"}, {
		callback = function()
		local prev_line = vim.fn.line("'-") -- Get previous line number
		local current_line = vim.fn.line(".") -- Get current line number

		-- Only process if the line actually changed
		if prev_line ~= current_line then 
		  llvp.process_current_line()
		end
	  end,
	})
else
	vim.api.nvim_create_autocmd({"CursorMoved"}, {
		pattern = "*.tex",
		callback = function()
		local prev_line = vim.fn.line("'-") -- Get previous line number
		local current_line = vim.fn.line(".") -- Get current line number

		-- Only process if the line actually changed
		if prev_line ~= current_line then 
		  llvp.process_current_line()
		end
	  end,
	})
end


-- Call the connect when we load













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

--[[
local function handle_output(job_id, data, event)
	local file = io.open(KVTRoot .. "/backend/resources/consoleoutput.txt","a")
	file:write(data .. "\n end of entry \n")
	file:close()
end
]]

local function run_script(interpreter, script_path)
  if vim.fn.filereadable(script_path) == 1 then
    local cmd = {interpreter, script_path, KVTRoot, WEBKIT_PORT, PROCESS_PORT }
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















-- socket.sleep(5)



-- llvp.connect()

vim.defer_fn(function() 
  llvp.connect() 
end, 400) -- Delay for 100 milliseconds


return llvp
