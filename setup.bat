@echo off
echo.
echo  ██╗  ██╗ █████╗ ██████╗ ██╗██████╗ ██╗
echo  ██║  ██║██╔══██╗██╔══██╗██║██╔══██╗██║
echo  ███████║███████║██████╔╝██║██████╔╝██║
echo  ██╔══██║██╔══██║██╔══██╗██║██╔══██╗██║
echo  ██║  ██║██║  ██║██████╔╝██║██████╔╝██║
echo  ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═════╝ ╚═╝
echo                    AIRWAYS SETUP
echo.
echo [1/3] Removing old node_modules and lock file...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [2/3] Installing dependencies (this takes 2-3 minutes)...
npm install

echo [3/3] Starting development server...
echo.
echo  Open http://localhost:3000 in your browser
echo  Demo login available — no Firebase needed!
echo.
npm start
