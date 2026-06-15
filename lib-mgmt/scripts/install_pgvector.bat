@echo off
REM ============================================================
REM  install_pgvector.bat — Build & install pgvector for PG 18
REM  Must be run as Administrator.
REM ============================================================

echo [1/5] Setting up Visual Studio 2022 x64 build environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" amd64
if errorlevel 1 (
    echo FATAL: Could not initialize Visual Studio build tools.
    exit /b 1
)

echo [2/5] Setting PGROOT...
set "PGROOT=C:\Program Files\PostgreSQL\18"

echo [3/5] Cloning pgvector (latest release)...
cd /d %TEMP%
if exist pgvector rd /s /q pgvector
git clone --branch v0.8.2 https://github.com/pgvector/pgvector.git
if errorlevel 1 (
    echo FATAL: git clone failed.
    exit /b 1
)
cd pgvector

echo [4/5] Building pgvector...
nmake /F Makefile.win
if errorlevel 1 (
    echo FATAL: Build failed.
    exit /b 1
)

echo [5/5] Installing pgvector into PostgreSQL 18...
nmake /F Makefile.win install
if errorlevel 1 (
    echo FATAL: Install failed. Make sure you are running as Administrator.
    exit /b 1
)

echo.
echo ============================================================
echo  pgvector installed successfully!
echo  You can now run: CREATE EXTENSION vector;
echo ============================================================
