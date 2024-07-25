
## KaVimTex: Live LaTeX Preview in Neovim 

KaVimTex provides a live preview of your LaTeX code within Neovim, using KaTeX and a dedicated QT window. This can be useful for visualizing complex mathematical expressions, matrices, etc in real-time. 

![Screenshot](https://private-user-images.githubusercontent.com/61063602/351969768-56cbb908-f22e-47ad-95f8-f767fb2fd411.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjE4ODQwNDIsIm5iZiI6MTcyMTg4Mzc0MiwicGF0aCI6Ii82MTA2MzYwMi8zNTE5Njk3NjgtNTZjYmI5MDgtZjIyZS00N2FkLTk1ZjgtZjc2N2ZiMmZkNDExLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA3MjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNzI1VDA1MDIyMlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPThiOGYwMjY4ZDM1MTRiMDcwNGE2ODY5MjFlMjk1ZTkyZjQ2OWIyODkyZTNlN2M3YmJhNmFjM2U2YmIwYWViM2ImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.rOxJNbJidwM8aYkmiqihANnTiCKMIEi6LtS7a8gR1v0)

Pictured above: KaVimTeX Preview window above nvim, with Zathura on the right hand side.

### Features

* **Live Preview:**  Watch your LaTeX code come to life as you type.
* **Custom Commands Support:** KaVimTex recognizes your `\newcommand` and `\renewcommand` definitions for a seamless editing experience.
* **Configuration Options:** 
    * Control the search range for custom commands.
    * Enable KaVimTex for all file types.

### Installation

1. **Prerequisites:** Ensure you have the following installed:
    * **Luasocket:**  Install via LuaRocks (e.g., `luarocks install luasocket`).
    * **Python3**
    * **NodeJS**
2. **Install KaVimTex using your preferred plugin manager:**

   **vim-plug** 
   ```viml
   call plug#begin()   " Begin managing plugins 

   Plug 'RohanModi-CA/KaVimTeX'

   call plug#end()     " End managing plugins
   ```

   **packer.nvim**
   ```lua
   -- Your other packer configurations...

   use {
       'RohanModi-CA/KaVimTeX',
       -- Optional configuration options can go here
   } 

   -- ... Rest of your packer setup
   ```

3. **Restart Neovim:** After installing the plugin, either restart Neovim or source your configuration file. 

### Usage

1. **Start the Server:**  Run `:KVTServer` within Neovim. This will initiate the preview window.
2. **Enjoy Live Preview:** Start writing LaTeX! Your changes will be reflected in the preview window.

**Tips:**

* **Convenient Aliasing:** Add an alias to your shell configuration (e.g., `alias kvt='nvim -c "KVTServer"'`) for a faster startup.
* **I3 Users:** Check out the example script in `backend/resources/i3/` to set up an efficient layout for KaVimTex.
* **Enable non-.tex Files:** Enable KaVimTex for all file types by adding `let g:KVTRunOnAllFileTypes` to your `init.vim` or `.vimrc`.


### Technical Details

* **Window Size:** The preview window size is fixed. In most cases, this shouldn't be a major issue, but manual adjustment may be needed occasionally. 
* **Rendering Engine:** KaVimTex uses the QTWebEngine for rendering, which generally provides good performance. Users with limited system resources may want to consider this aspect.


### Motivation

I'm a physics undergrad, and Overleaf is frustrating and slow, and I've found the other existing LaTeX quick preview tools (like Obsidian, for example) to be limited in that they don't let you actually type LaTeX, but rather some markdown with TeX support. I still want to be able to use full LaTeX, whatever packages, etc; just while being able to see what I'm writing. Hence this plugin.

KaVimTex provides a live preview within Vim while supporting the large range of syntax that KaTeX supports. While it doesn't render all LaTeX elements, it allows users to write unrestricted LaTeX code; unsupported commands will simply not be rendered in the preview. 


### Contributing

Contributions to KaVimTex are welcome! If you have any ideas for improvements, bug fixes, or new features, please feel free to:

* **Open an Issue:**  Report bugs, suggest enhancements, or propose new features by opening an issue on the GitHub repository.
* **Email:**  Contact me directly at the email address listed on my GitHub profile if you prefer to discuss contributions in more detail.
