@echo off
echo =============================
echo 🧹 CLEANING ADMIN FEATURE FRONTEND
echo =============================

REM Hapus halaman admin
if exist src\pages\AdminDashboardPage.tsx (
  del src\pages\AdminDashboardPage.tsx
  echo ✅ AdminDashboardPage.tsx deleted
) else (
  echo ⚠️ AdminDashboardPage.tsx not found
)

REM Backup routes.tsx dulu
copy src\routes.tsx src\routes.backup.tsx > nul

REM Bersihkan /admin route dari routes.tsx
powershell -Command ^
  "(Get-Content src\routes.tsx) ^
  -replace '.*path: ''/admin''.*?\\},', '' |
  Set-Content src\routes.tsx"

echo ✅ /admin route removed from routes.tsx

REM Info tambahan
echo.
echo 🔔 Selesai. Jika ada pemanggilan API /api/admin di komponen lain, silakan hapus manual.
echo 🔁 File backup: src\routes.backup.tsx
pause
