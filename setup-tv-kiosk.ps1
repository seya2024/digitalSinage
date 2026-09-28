# ============================================================
#  DASHEN BANK TV DASHBOARD - One-Click Kiosk Setup
#  Run as Administrator
# ============================================================

# Check for admin rights
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell > Run as Administrator" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    Exit
}

Clear-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   DASHEN BANK TV DASHBOARD - KIOSK SETUP" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# ---- Ask for config ----
$branchCode = Read-Host "Enter branch code (e.g., JIM001)"
$serverUrl = Read-Host "Enter server URL (default: http://localhost:3000)"
if ([string]::IsNullOrWhiteSpace($serverUrl)) {
    $serverUrl = "http://localhost:3000"
}
$dashboardUrl = "$serverUrl/?branch=$branchCode"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Branch Code : $branchCode"
Write-Host "  Server URL  : $serverUrl"
Write-Host "  Dashboard   : $dashboardUrl"
Write-Host ""

# ---- Step 1: Find Chrome ----
Write-Host "[1/4] Locating Chrome..." -ForegroundColor Yellow

$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chrome = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chrome = $path
        break
    }
}

if (-not $chrome) {
    Write-Host "ERROR: Chrome not found!" -ForegroundColor Red
    Write-Host "Download from: https://www.google.com/chrome/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    Exit
}

Write-Host "  OK - Found: $chrome" -ForegroundColor Green

# ---- Step 2: Enable Auto-Login ----
Write-Host ""
Write-Host "[2/4] Enabling Windows auto-login..." -ForegroundColor Yellow

$user = $env:USERNAME
$securePass = Read-Host "  Enter Windows password for '$user'" -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
)

$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

try {
    Set-ItemProperty -Path $regPath -Name "AutoAdminLogon" -Value "1" -Force
    Set-ItemProperty -Path $regPath -Name "DefaultUserName" -Value $user -Force
    Set-ItemProperty -Path $regPath -Name "DefaultPassword" -Value $plainPass -Force
    Set-ItemProperty -Path $regPath -Name "DefaultDomainName" -Value $env:COMPUTERNAME -Force
    Write-Host "  OK - Auto-login enabled for $user" -ForegroundColor Green
} catch {
    Write-Host "  WARN - Could not enable auto-login: $_" -ForegroundColor Yellow
}

# ---- Step 3: Disable Sleep ----
Write-Host ""
Write-Host "[3/4] Disabling sleep and screen-off..." -ForegroundColor Yellow

powercfg /x monitor-timeout-ac 0 | Out-Null
powercfg /x standby-timeout-ac 0 | Out-Null
powercfg /x hibernate-timeout-ac 0 | Out-Null
powercfg /x monitor-timeout-dc 0 | Out-Null
powercfg /x standby-timeout-dc 0 | Out-Null

Write-Host "  OK - Sleep and screen-off disabled" -ForegroundColor Green

# ---- Step 4: Create Kiosk Launcher ----
Write-Host ""
Write-Host "[4/4] Creating Chrome kiosk launcher..." -ForegroundColor Yellow

$batPath = "C:\dashen-tv-kiosk.bat"

$batContent = "@echo off`r`n" +
              "title Dashen Bank TV Dashboard`r`n" +
              "timeout /t 15 /nobreak >nul`r`n" +
              "start `"`" `"$chrome`" --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble --incognito `"$dashboardUrl`"`r`n"

Set-Content -Path $batPath -Value $batContent -Encoding ASCII
Write-Host "  OK - Created $batPath" -ForegroundColor Green

# ---- Add to Startup folder ----
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shortcutPath = "$startupFolder\DashenTVKiosk.lnk"

$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut($shortcutPath)
$sc.TargetPath = $batPath
$sc.WorkingDirectory = "C:\"
$sc.WindowStyle = 7
$sc.Description = "Dashen Bank TV Dashboard Kiosk"
$sc.Save()

Write-Host "  OK - Added to Startup folder" -ForegroundColor Green

# ---- Schedule in Task Scheduler ----
try {
    Unregister-ScheduledTask -TaskName "DashenTVKiosk" -Confirm:$false -ErrorAction SilentlyContinue

    $action = New-ScheduledTaskAction -Execute $batPath
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -Hidden

    Register-ScheduledTask -TaskName "DashenTVKiosk" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

    Write-Host "  OK - Task Scheduler entry created" -ForegroundColor Green
} catch {
    Write-Host "  WARN - Could not create scheduled task: $_" -ForegroundColor Yellow
}

# ---- Done ----
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "What was configured:" -ForegroundColor Cyan
Write-Host "  - Auto-login on boot"
Write-Host "  - Sleep and screen-off disabled"
Write-Host "  - Chrome kiosk launches on login"
Write-Host ""
Write-Host "Branch dashboard URL:" -ForegroundColor Yellow
Write-Host "  $dashboardUrl" -ForegroundColor White
Write-Host ""

$test = Read-Host "Launch the dashboard right now? (y/n)"
if ($test -eq "y") {
    Start-Process -FilePath $batPath
    Write-Host "Launched!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Restart the PC to test the full auto-start flow." -ForegroundColor Yellow
Read-Host "Press Enter to close"