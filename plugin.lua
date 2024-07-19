local llvp = {}

local socket = require('socket')

local HOST = "127.0.0.1"
local PORT = 3000

local client

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
		print("Not connected to JavaScript process")
	end
end

function llvp.receive_data(data)
	if client then
		local data,err = client:receive("*l")
		if data then
			return data
		else
			print("Error receiving data: ", err)
		end
	else
		print("Not Connected to JS Process")
	end
end


function llvp.process_current_line()
  local current_line = vim.fn.getline('.') -- :gsub("^%s*[%d]+", "")  -- Get current line and strip line numbers
  llvp.send_data(current_line)

--[[
  local processed_line = llvp.receive_data()

  -- Handle potential errors if processed_line is nil 
  if processed_line then 
    vim.fn.setline('.', processed_line) -- Update the current line in the buffer 
  else
    print("Error receiving processed line from JavaScript")
  end

  ]]--
end

vim.api.nvim_create_autocmd({"TextChangedI"},{
	
	pattern = "*.tex",
	callback = function()
		llvp.process_current_line()
	end,

})


-- Call the connect when we load
llvp.connect()

return llvp
