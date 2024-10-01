local stop_on_doc = vim.g.KVTSearchForCommandsPastBeginDoc == nil
local buffer = vim.api.nvim_get_current_buf()
local line_array = vim.api.nvim_buf_get_lines(buffer, 1, -1, false)

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



-- see if the file exists
function file_exists(file)
	local f = io.open(file, "rb")
	if f then f:close() end
	return f ~= nil
end
-- get all lines from a file, returns an empty list/table if the file does not exist
function lines_from(file)
	if not file_exists(file) then return {} end
	local lines = {}
	for line in io.lines(file) do 
	lines[#lines + 1] = line
	end
	return lines
end


function search_handle_commands(line_array, file_to_write)
	for i = 1, #line_array do
		if stop_on_doc and string.find(line_array[i], "\\begin{document}") then
			break
		end

		-- search to see if there are styles being \input-ed from other files, if so recurse and run this on them.
		input_file = line_array[i]:match("\\input%s*{([^}]+)}")
		local lines_of_inp = {}
		if(input_file) then
			lines_of_inp = lines_from(input_file)
			search_handle_commands(lines_of_inp, file_to_write)
		end

		if string.find(line_array[i], "newcommand") then
			if string.find(line_array[i], "\\newcommand") or string.find(line_array[i], "\\renewcommand") then
				local term = string.sub(line_array[i], string.find(line_array[i], "{"), -1)

				if string.find(line_array[i], "%%") then
					term = string.sub(term, 1, string.find(line_array[i], "%%"))
				end

				local new_old = {}
				local start_pos = 0
				local brace_count = 0

				for j = 1, #term do
					local char = string.sub(term, j, j)
					if char == '{' then
						if brace_count == 0 then
							start_pos = j + 1 
						end
						brace_count = brace_count + 1
					elseif char == '}' then
						brace_count = brace_count - 1
						if brace_count == 0 then 
							table.insert(new_old, string.sub(term, start_pos, j - 1))
						end
					end
				end

				-- Write pairs to the file
				if #new_old >= 2 then -- Ensure we have at least two arguments
					file_to_write:write(new_old[1] .. "KVTNEWCOMMAND" .. new_old[2] .. "\n")
				end
			end
		end
	end
end




-- Open "resources/aliases.txt" in write mode (overwrites existing content)
local file = io.open(KVTRoot .. "/backend/resources/aliases.txt", "w")
search_handle_commands(line_array, file)








-- add the universal fixes:
local universal_fixes = [[
	\medskipKVTNEWCOMMAND.     .           
	\smallskipKVTNEWCOMMAND.   .
	\bigskipKVTNEWCOMMAND.        .                 
	\section*KVTNEWCOMMAND.
	\subsection*KVTNEWCOMMAND.
	\label*KVTNEWCOMMAND\text{ }\text
]] -- in lua strings in [[]] do not require escape characters
file:write(universal_fixes)


-- Close the file
file:close()
