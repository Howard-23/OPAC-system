; ============================================================
; infoLib NSIS Installer Hooks
; General de Jesus College — Library Management System
; ============================================================
; This file injects custom logic into the Tauri v2 NSIS installer.
; Dependencies: PostgreSQL 18 Portable, Ollama CLI
; ============================================================

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; --- Variables ---
Var DbHost
Var DbPort
Var DbUser
Var DbPass
Var DbName
Var Dialog
Var LabelHost
Var LabelPort
Var LabelUser
Var LabelPass
Var LabelName
Var InputHost
Var InputPort
Var InputUser
Var InputPass
Var InputName
Var SystemPgFound
Var SystemOllamaFound

; ============================================================
; CUSTOM PAGE: Database Credentials
; ============================================================

Function CUSTOM_PAGE_DATABASE
  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ; Title
  ${NSD_CreateLabel} 0 0 100% 20u "Configure PostgreSQL Database"
  Pop $0
  CreateFont $1 "Segoe UI" 11 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Host
  ${NSD_CreateLabel} 0 30u 80u 12u "Host:"
  Pop $LabelHost
  ${NSD_CreateText} 85u 28u 200u 14u "localhost"
  Pop $InputHost

  ; Port
  ${NSD_CreateLabel} 0 50u 80u 12u "Port:"
  Pop $LabelPort
  ${NSD_CreateText} 85u 48u 200u 14u "5432"
  Pop $InputPort

  ; Username
  ${NSD_CreateLabel} 0 70u 80u 12u "Username:"
  Pop $LabelUser
  ${NSD_CreateText} 85u 68u 200u 14u "postgres"
  Pop $InputUser

  ; Password
  ${NSD_CreateLabel} 0 90u 80u 12u "Password:"
  Pop $LabelPass
  ${NSD_CreatePassword} 85u 88u 200u 14u ""
  Pop $InputPass

  ; Database Name
  ${NSD_CreateLabel} 0 110u 80u 12u "Database:"
  Pop $LabelName
  ${NSD_CreateText} 85u 108u 200u 14u "infolib"
  Pop $InputName

  ; Detection Info
  ${If} $SystemPgFound == "1"
    ${NSD_CreateLabel} 0 135u 100% 12u "✓ System PostgreSQL detected. You may use existing credentials."
    Pop $0
    CreateFont $1 "Segoe UI" 8 700
    SendMessage $0 ${WM_SETFONT} $1 0
  ${Else}
    ${NSD_CreateLabel} 0 135u 100% 12u "No system PostgreSQL found. Bundled PostgreSQL will be installed."
    Pop $0
    CreateFont $1 "Segoe UI" 8 400
    SendMessage $0 ${WM_SETFONT} $1 0
  ${EndIf}

  ; Footer
  ${NSD_CreateLabel} 0 150u 100% 24u "These credentials will be saved securely. You can change them later in Settings > Database."
  Pop $0
  CreateFont $1 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $1 0

  nsDialogs::Show
FunctionEnd

Function CUSTOM_PAGE_DATABASE_LEAVE
  ${NSD_GetText} $InputHost $DbHost
  ${NSD_GetText} $InputPort $DbPort
  ${NSD_GetText} $InputUser $DbUser
  ${NSD_GetText} $InputPass $DbPass
  ${NSD_GetText} $InputName $DbName
FunctionEnd

; ============================================================
; HOOK: PREINSTALL — Detect system deps + show DB page
; ============================================================

!macro NSIS_HOOK_PREINSTALL
  ; --- Detect System PostgreSQL ---
  StrCpy $SystemPgFound "0"

  ; Check 1: pg_ctl in PATH
  nsExec::ExecToStack 'where pg_ctl'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    DetailPrint "System PostgreSQL detected via PATH."
    Goto pg_detect_done
  ${EndIf}

  ; Check 2: PostgreSQL service running
  nsExec::ExecToStack 'sc query postgresql-x64-18'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    DetailPrint "PostgreSQL service detected."
    Goto pg_detect_done
  ${EndIf}

  ; Check 3: Common install paths
  IfFileExists "$PROGRAMFILES\PostgreSQL\18\bin\pg_ctl.exe" 0 +3
    StrCpy $SystemPgFound "1"
    DetailPrint "PostgreSQL 18 found at $PROGRAMFILES."

  IfFileExists "$PROGRAMFILES\PostgreSQL\17\bin\pg_ctl.exe" 0 +3
    StrCpy $SystemPgFound "1"
    DetailPrint "PostgreSQL 17 found at $PROGRAMFILES."

  pg_detect_done:

  ; --- Detect System Ollama ---
  StrCpy $SystemOllamaFound "0"

  ; Check 1: ollama in PATH
  nsExec::ExecToStack 'where ollama'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemOllamaFound "1"
    DetailPrint "System Ollama detected via PATH."
    Goto ollama_detect_done
  ${EndIf}

  ; Check 2: Ollama running (API check)
  nsExec::ExecToStack 'curl -s http://localhost:11434/api/version'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemOllamaFound "1"
    DetailPrint "Ollama API responding on localhost:11434."
    Goto ollama_detect_done
  ${EndIf}

  ; Check 3: Common install paths
  IfFileExists "$LOCALAPPDATA\Programs\Ollama\ollama.exe" 0 +3
    StrCpy $SystemOllamaFound "1"
    DetailPrint "Ollama found at $LOCALAPPDATA."

  ollama_detect_done:

  ; Insert custom database credentials page
  Page custom CUSTOM_PAGE_DATABASE CUSTOM_PAGE_DATABASE_LEAVE
!macroend

; ============================================================
; HOOK: POSTCOPY — Install dependencies + write config
; ============================================================

!macro NSIS_HOOK_POSTCOPY
  SetDetailsPrint textonly

  ; --- Step 1: PostgreSQL ---
  ${If} $SystemPgFound == "1"
    DetailPrint "Using system PostgreSQL. Skipping bundled install."
  ${Else}
    ; Check if bundled PG already extracted from a prior install
    IfFileExists "$INSTDIR\pgsql\bin\pg_ctl.exe" pg_already_extracted pg_extract

    pg_extract:
      DetailPrint "Extracting PostgreSQL 18 Portable..."
      SetOutPath "$INSTDIR\pgsql"
      File /r "${__FILEDIR__}\..\..\deps\pgsql\*.*"

      ; Create log directory
      CreateDirectory "$INSTDIR\pgsql\log"

      ; Initialize database cluster
      DetailPrint "Initializing PostgreSQL data directory..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\initdb.exe" -D "$INSTDIR\pgsql\data" -U $DbUser -E UTF8 --no-locale'

      ; Start PostgreSQL
      DetailPrint "Starting PostgreSQL..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" -l "$INSTDIR\pgsql\log\postgresql.log" start'

      ; Wait for PG to become ready
      DetailPrint "Waiting for PostgreSQL to start..."
      Sleep 3000

      ; Set password for the user
      DetailPrint "Setting database user password..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\psql.exe" -U $DbUser -c "ALTER USER $DbUser PASSWORD $\'$DbPass$\'"'

      ; Create database
      DetailPrint "Creating database: $DbName..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\createdb.exe" -U $DbUser $DbName'

      Goto pg_done

    pg_already_extracted:
      DetailPrint "Bundled PostgreSQL already present. Ensuring service is running..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" -l "$INSTDIR\pgsql\log\postgresql.log" start'

    pg_done:
  ${EndIf}

  ; --- Step 2: Ollama ---
  ${If} $SystemOllamaFound == "1"
    DetailPrint "Using system Ollama. Skipping bundled install."
  ${Else}
    IfFileExists "$INSTDIR\ollama\ollama.exe" ollama_already_extracted ollama_extract

    ollama_extract:
      DetailPrint "Extracting Ollama AI Engine..."
      SetOutPath "$INSTDIR\ollama"
      File /r "${__FILEDIR__}\..\..\deps\ollama\*.*"
      DetailPrint "Ollama extracted."
      Goto ollama_done

    ollama_already_extracted:
      DetailPrint "Bundled Ollama already present."

    ollama_done:
  ${EndIf}

  ; --- Step 3: Create config directory and write db_config.json ---
  DetailPrint "Writing database configuration..."
  CreateDirectory "$APPDATA\ph.edu.gendejesus.infolib"
  FileOpen $0 "$APPDATA\ph.edu.gendejesus.infolib\db_config.json" w
  FileWrite $0 '{$\r$\n'
  FileWrite $0 '  "database_url": "postgres://$DbUser:$DbPass@$DbHost:$DbPort/$DbName"$\r$\n'
  FileWrite $0 '}$\r$\n'
  FileClose $0
  DetailPrint "Configuration saved to %APPDATA%."

  ; --- Step 4: Register environment ---
  WriteRegStr HKCU "Environment" "INFOLIB_HOME" "$INSTDIR"

  DetailPrint "infoLib setup complete."
  SetDetailsPrint lastused
!macroend

; ============================================================
; HOOK: PREUNINSTALL — Stop services before removal
; ============================================================

!macro NSIS_HOOK_PREUNINSTALL
  ; Stop bundled PostgreSQL if present
  IfFileExists "$INSTDIR\pgsql\bin\pg_ctl.exe" 0 skip_pg_stop
    DetailPrint "Stopping bundled PostgreSQL..."
    nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" stop -m fast'
  skip_pg_stop:

  ; Clean registry
  DeleteRegValue HKCU "Environment" "INFOLIB_HOME"

  DetailPrint "Services stopped. Proceeding with uninstall."
!macroend
