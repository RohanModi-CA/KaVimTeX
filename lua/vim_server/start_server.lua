local llvp = {}

local socket = require('socket')

local HOST = "127.0.0.1"
local PORT = 63002

local client

-- check newcommands:
local newcommands = require('command_aliasing')
--


function llvp.connect()
	client = socket.connect(HOST, PORT)

	if client then
		 print("Connected to the JS Process")
	else
		 print("Failed to connect to the JS Process")
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



-- Call the connect when we load
llvp.connect()

return llvp
