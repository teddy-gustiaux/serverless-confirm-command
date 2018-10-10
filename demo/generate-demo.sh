#!/bin/bash

# Font types
normal=$(tput sgr0)
bold=$(tput bold)

# Font colors
default="\e[39m"
cyan="\e[96m"
green="\e[32m"

# Symbols and strings
arrow="\U2192"
folder="demo"
shell_simulation="${bold}${green}${arrow}${default}  ${cyan}${folder}${default}${normal} "

# Demo
echo -ne "${shell_simulation}" && echo "# Let's remove our serverless application!" | pv -qL 12
echo -ne "${shell_simulation}" && echo "sls remove" | pv -qL 12
sls remove
echo -ne "${shell_simulation}" && echo "# Right, I have to confirm this!" | pv -qL 12
echo -ne "${shell_simulation}" && echo "sls remove --confirm # This will actually remove the application!" | pv -qL 12