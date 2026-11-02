@echo off
rem Serves this folder on http://localhost:8080 for local testing. Needs Python.
rem Put your key in config.local.js and allow http://localhost:8080/* on the key. Close this window to stop.
cd /d "%~dp0"
start "" "http://localhost:8080/index.html"
python -m http.server 8080
