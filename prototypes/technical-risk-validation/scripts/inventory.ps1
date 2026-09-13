$validationOs = Get-CimInstance Win32_OperatingSystem
$validationCpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$validationSystem = Get-CimInstance Win32_ComputerSystem
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
  cpu = $validationCpu.Name
  logicalProcessors = $validationSystem.NumberOfLogicalProcessors
  ramGiB = [math]::Round($validationSystem.TotalPhysicalMemory / 1GB, 1)
  installedBrowsersFound = @($validationBrowsers)
  note = 'Inspected standard machine/user paths only. Missing entries are unconfirmed, not a proof of absence. No manual device or accessibility test inferred.'
} | ConvertTo-Json -Depth 4
