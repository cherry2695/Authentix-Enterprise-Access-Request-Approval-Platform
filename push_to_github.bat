@echo off
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\mingw64\bin;%PATH%"
cd /d "C:\Users\MSI\Downloads\AccessFlow"
echo =========================================================================
echo   AccessFlow: Pushing to GitHub
echo   Target: https://github.com/cherry2695/Authentix-Enterprise-Access-Request-Approval-Platform
echo =========================================================================
echo.
git push -u origin main --force
echo.
echo =========================================================================
pause
