@echo off
chcp 65001 >nul
echo ===================================================
echo     UET Downloader Pro - Trinh Cap Nhat Tu Dong
echo                 by HBM - Dawn
echo ===================================================
echo.
echo Dang kiem tra va tai ban cap nhat moi nhat tu GitHub...

where git >nul 2>nul
if %ERRORLEVEL% equ 0 (
    if exist ".git" (
        echo Dang cap nhat bang Git pull...
        git pull origin main
        goto done
    )
)

echo Dang tai ma nguon moi nhat tu GitHub qua PowerShell...
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'https://github.com/hbminh2508-design/uet-downloader-pro/archive/refs/heads/main.zip' -OutFile 'update_temp.zip'; Expand-Archive -Path 'update_temp.zip' -DestinationPath 'update_temp' -Force; Copy-Item -Path 'update_temp\uet-downloader-pro-main\*' -Destination '.' -Recurse -Force; Remove-Item 'update_temp.zip' -Force; Remove-Item 'update_temp' -Recurse -Force; Write-Host 'Cap nhat thanh cong!' -ForegroundColor Green } catch { Write-Host 'Loi khi tai ban cap nhat:' $_ -ForegroundColor Red }"

:done
echo.
echo ===================================================
echo  HOAN TAT!
echo  Hay vao trinh duyet (about:debugging hoac chrome://extensions)
echo  va bam nut [Tai lai] (Reload) de ap dung ban moi!
echo ===================================================
echo.
pause
