@echo off
setlocal

REM Ambil nama folder aktif
set CURRENT_DIR=%cd%
for %%F in ("%CURRENT_DIR%") do set LAST_FOLDER=%%~nxF

REM Validasi harus di folder 'frontend'
if /I not "%LAST_FOLDER%"=="frontend" (
  echo ❌ Script ini hanya boleh dijalankan di folder 'frontend'!
  pause
  exit /b
)

echo 🚀 Push dimulai dari folder: %CURRENT_DIR%

git add .
git commit -m "update frontend project"
git push origin main

pause
