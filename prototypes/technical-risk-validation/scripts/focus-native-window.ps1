param([Parameter(Mandatory=$true)][int]$ParentPid)

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class Phase1NativeWindow {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr window, int command);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window, out uint process);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr window);
}
'@

# Only a Chrome child of the invoking test process with a disposable profile qualifies.
$taskWindows = @(Get-CimInstance Win32_Process -Filter "name = 'chrome.exe'" | Where-Object {
  $_.ParentProcessId -eq $ParentPid -and $_.CommandLine -match '--user-data-dir=' -and
  $_.CommandLine -match 'playwright_chromiumdev_profile|phase1-profiles'
} | ForEach-Object {
  $taskProcess = Get-Process -Id $_.ProcessId -ErrorAction Stop
  $taskWindow = $taskProcess.MainWindowHandle
  if ($taskWindow -ne [IntPtr]::Zero) {
    $taskRestore = [Phase1NativeWindow]::ShowWindowAsync($taskWindow, 9)
    $taskForegroundRequested = [Phase1NativeWindow]::SetForegroundWindow($taskWindow)
    $taskForeground = [Phase1NativeWindow]::GetForegroundWindow()
    [uint32]$taskForegroundPid = 0
    [void][Phase1NativeWindow]::GetWindowThreadProcessId($taskForeground, [ref]$taskForegroundPid)
    [pscustomobject]@{
      browserPid = $_.ProcessId
      parentPid = $ParentPid
      window = $taskWindow.ToInt64()
      restoreRequested = $taskRestore
      foregroundRequested = $taskForegroundRequested
      foregroundObserved = $taskForegroundPid -eq $_.ProcessId
      visible = [Phase1NativeWindow]::IsWindowVisible($taskWindow)
      minimized = [Phase1NativeWindow]::IsIconic($taskWindow)
    }
  }
})
[pscustomobject]@{ windows = $taskWindows; ordinaryWindowsTouched = $false; note = 'Win32 control restricted to disposable-profile Chrome children of this test process; failure to focus is inconclusive' } | ConvertTo-Json -Depth 4
