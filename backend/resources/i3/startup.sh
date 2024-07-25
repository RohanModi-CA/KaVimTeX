#!/bin/sh

# Extract the last argument
last_arg="$1"

# Start background processes and capture PIDs
i3_pid=$(nohup i3-msg "append_layout /path/to/i3.json" >/dev/null 2>&1 & echo $!)
kitty_pid=$(nohup nohup kitty -e nvim -c "KVTServer" -c "VimtexCompile" -c "VimtexClean" -c "redraw!" "$last_arg" > /dev/null 2>&1 & echo $!)

# Check if all processes are running using a loop
while ps -p "$i3_pid" > /dev/null 2>&1 && ps -p "$kvt_pid" > /dev/null 2>&1 && ps -p "$kitty_pid" > /dev/null 2>&1; do
  # Wait for a short interval
  sleep 0.1
done

# Kill the terminal (using PPID)
kill -9 $PPID

# Exit
exit 0
