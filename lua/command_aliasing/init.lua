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





-- Open "resources/aliases.txt" in write mode (overwrites existing content)
local file = io.open(KVTRoot .. "/backend/resources/aliases.txt", "w")

for i = 1, #line_array do
    if stop_on_doc and string.find(line_array[i], "\\begin{document}") then
        break
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
                file:write(new_old[1] .. "KVTNEWCOMMAND" .. new_old[2] .. "\n")
            end
        end
    end
end

-- add the universal fixes:
local universal_fixes = [[
\medskipKVTNEWCOMMANDmedskip
\smallskipKVTNEWCOMMAND\n
\bigskipKVTNEWCOMMANDbigskip
]] -- in lua strings in [[]] do not require escape characters

file:write(universal_fixes)


-- Close the file
file:close()
