$validationOs = Get-CimInstance Win32_OperatingSystem
$validationCpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$validationSystem = Get-CimInstance Win32_ComputerSystem
$validationVersion = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -ErrorAction Stop
$validationRegistryChecks = foreach ($validationRegistryKey in @(
  'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe',
  'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe',
  'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe',
  'HKCU:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe'
)) {
  $validationRegistryFound = Test-Path -LiteralPath $validationRegistryKey
  $validationRegisteredBrowser = $null
  if ($validationRegistryFound) {
    $validationRegisteredPath = (Get-ItemProperty -LiteralPath $validationRegistryKey -ErrorAction Stop).'(default)'
    if ($validationRegisteredPath -is [string] -and (Test-Path -LiteralPath $validationRegisteredPath -PathType Leaf)) {
      $validationRegisteredFile = Get-Item -LiteralPath $validationRegisteredPath -ErrorAction Stop
      if ($validationRegisteredFile.Name -eq 'firefox.exe') {
        $validationRegisteredBrowser = [pscustomobject]@{ application = $validationRegisteredFile.Name; version = $validationRegisteredFile.VersionInfo.ProductVersion }
      }
    }
  }
  [pscustomobject]@{ key = $validationRegistryKey; keyPresent = $validationRegistryFound; executable = $validationRegisteredBrowser }
}
$validationCandidates = @(
  "$env:ProgramFiles/Google/Chrome/Application/chrome.exe",
  "${env:ProgramFiles(x86)}/Google/Chrome/Application/chrome.exe",
  "$env:LOCALAPPDATA/Google/Chrome/Application/chrome.exe",
  "$env:ProgramFiles/Mozilla Firefox/firefox.exe",
  "${env:ProgramFiles(x86)}/Mozilla Firefox/firefox.exe",
  "$env:LOCALAPPDATA/Mozilla Firefox/firefox.exe"
)
$validationBrowsers = foreach ($validationCandidate in $validationCandidates) {
  if (Test-Path -LiteralPath $validationCandidate) {
    [pscustomobject]@{ application = [System.IO.Path]::GetFileName($validationCandidate); version = (Get-Item -LiteralPath $validationCandidate).VersionInfo.ProductVersion }
  }
}
[pscustomobject]@{
  recordedAt = [DateTime]::UtcNow.ToString('o')
  os = $validationOs.Caption
  version = $validationOs.Version
  build = $validationOs.BuildNumber
  displayVersion = $validationVersion.DisplayVersion
  buildRevision = $validationVersion.UBR
  fullBuild = "$($validationOs.BuildNumber).$($validationVersion.UBR)"
  cpu = $validationCpu.Name
  manufacturer = $validationSystem.Manufacturer
  model = $validationSystem.Model
  logicalProcessors = $validationSystem.NumberOfLogicalProcessors
  ramGiB = [math]::Round($validationSystem.TotalPhysicalMemory / 1GB, 1)
  ramBytes = $validationSystem.TotalPhysicalMemory
  display = @(Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,CurrentHorizontalResolution,CurrentVerticalResolution)
  installedBrowsersFound = @($validationBrowsers)
  firefoxAppPathRegistry = @($validationRegistryChecks)
  interaction = 'Codex Playwright/CDP automation; physical typing and assistive technology not established by inventory'
  note = 'Inspected standard machine/user browser paths and four Firefox App Paths registry keys only. Missing entries are unconfirmed, not a proof of absence. No ordinary profile contents or manual device/accessibility evidence collected.'
} | ConvertTo-Json -Depth 4
