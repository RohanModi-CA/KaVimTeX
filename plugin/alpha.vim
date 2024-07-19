if exists('g:loaded_alpha') | finish | endif " prevent loading file twice

let s:save_cpo = &cpo " save user coptions
set cpo&vim           " reset them to defaults" command to run our plugin


function KVTCommence()
	lua require("vim_server")
	lua require("python_run")
	lua require("node_run")
endfunction

command! KVTCommence call KVTCommence()


let &cpo = s:save_cpo " and restore after
unlet s:save_cpo 
let g:loaded_alpha = 1
