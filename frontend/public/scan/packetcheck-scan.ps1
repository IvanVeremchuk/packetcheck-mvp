<#
  PacketCheck quick scan for Windows.

  Read-only: it looks, it changes nothing, and it sends nothing anywhere.
  It lists who your computer is listening for, who it is talking to right now,
  whether Remote Desktop is on, which remote-control tools are installed, what
  starts with Windows, and who has admin rights. The report is saved to your
  Desktop and copied to the clipboard so you can paste it at packetcheck.net.

  Run it:
    powershell -ExecutionPolicy Bypass -File .\packetcheck-scan.ps1

  Works on Windows PowerShell 5.1 and PowerShell 7. Running as administrator
  shows a little more (Defender exclusions), but it is not required.
#>

$ErrorActionPreference = 'SilentlyContinue'
$started = Get-Date
$out = New-Object System.Collections.Generic.List[string]

function Emit([object[]]$parts) {
  $clean = foreach ($p in $parts) { ([string]$p) -replace "[\t\r\n]+", ' ' }
  $out.Add(($clean -join "`t"))
}

# Names of remote-access tools, tunnels and known remote-access trojans.
$remoteTools = 'teamviewer|anydesk|rustdesk|screenconnect|connectwise|splashtop|logmein|gotoassist|goto resolve|ammyy|vnc|winvnc|tvnserver|netsupport|client32|rutserv|rfusclient|remote utilities|atera|meshagent|mesh agent|simplehelp|supremo|remotepc|zoho assist|zohoassist|dwagent|dwservice|radmin|action1|kaseya|tacticalrmm|ngrok|cloudflared|chisel|frpc|plink|remoting_host|chrome remote desktop|beyondtrust|bomgar|nomachine|nxserver|itarian|pulseway|ninjarmm|syncro|quasar|asyncrat|njrat|remcos|darkcomet|nanocore|dcrat|xworm|warzone|netwire|meterpreter|ultraviewer|hoptodesk|aeroadmin|todesk|iperius|getscreen|quickassist'

Write-Host ''
Write-Host '  PacketCheck quick scan' -ForegroundColor Green
Write-Host '  Read-only. Nothing is changed or uploaded.' -ForegroundColor Gray
Write-Host ''

$os = (Get-CimInstance Win32_OperatingSystem).Caption
$out.Add("#PACKETCHECK v1 os=windows date=$($started.ToString('s'))")
Emit @('INFO', 'os', $os)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Emit @('INFO', 'elevated', $(if ($isAdmin) { 1 } else { 0 }))

# Process table, used to name the owner of every connection.
$procs = @{}
foreach ($p in (Get-CimInstance Win32_Process)) { $procs[[int]$p.ProcessId] = $p }
function ProcName([int]$id) { if ($procs.ContainsKey($id)) { $procs[$id].Name } else { '' } }
function ProcPath([int]$id) { if ($procs.ContainsKey($id) -and $procs[$id].ExecutablePath) { $procs[$id].ExecutablePath } else { '' } }

Write-Host '  [1/6] Network connections' -ForegroundColor Gray
$netPids = @{}
$tcp = Get-NetTCPConnection
if ($tcp) {
  foreach ($c in $tcp) {
    $id = [int]$c.OwningProcess
    if ($c.State -eq 'Listen') {
      Emit @('LISTEN', 'TCP', $c.LocalAddress, $c.LocalPort, $id, (ProcName $id), (ProcPath $id))
      $netPids[$id] = $true
    }
    elseif ($c.State -eq 'Established' -or $c.State -eq 'SynSent') {
      Emit @('CONN', 'TCP', $c.LocalAddress, $c.LocalPort, $c.RemoteAddress, $c.RemotePort, $c.State, $id, (ProcName $id), (ProcPath $id))
      $netPids[$id] = $true
    }
  }
}
else {
  # Older systems: fall back to netstat.
  foreach ($line in (netstat -ano)) {
    $f = ($line.Trim() -split '\s+')
    if ($f.Count -lt 5 -or $f[0] -ne 'TCP') { continue }
    $lp = $f[1].LastIndexOf(':'); $rp = $f[2].LastIndexOf(':')
    $id = [int]$f[4]
    if ($f[3] -eq 'LISTENING') {
      Emit @('LISTEN', 'TCP', $f[1].Substring(0, $lp), $f[1].Substring($lp + 1), $id, (ProcName $id), (ProcPath $id))
      $netPids[$id] = $true
    }
    elseif ($f[3] -eq 'ESTABLISHED' -or $f[3] -eq 'SYN_SENT') {
      Emit @('CONN', 'TCP', $f[1].Substring(0, $lp), $f[1].Substring($lp + 1), $f[2].Substring(0, $rp), $f[2].Substring($rp + 1), $f[3], $id, (ProcName $id), (ProcPath $id))
      $netPids[$id] = $true
    }
  }
}

Write-Host '  [2/6] Remote Desktop and active sessions' -ForegroundColor Gray
$ts = Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server'
if ($ts) { Emit @('RDP', 'enabled', $(if ($ts.fDenyTSConnections -eq 0) { 1 } else { 0 })) }
$rdpTcp = Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp'
if ($rdpTcp) {
  Emit @('RDP', 'port', $rdpTcp.PortNumber)
  Emit @('RDP', 'nla', $rdpTcp.UserAuthentication)
}
$ra = Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Remote Assistance'
if ($ra) { Emit @('ASSIST', 'enabled', $ra.fAllowToGetHelp) }
$sessions = qwinsta 2>$null
if ($sessions) {
  foreach ($line in ($sessions | Select-Object -Skip 1)) {
    if ($line.Trim()) { Emit @('SESSION', $line.Trim()) }
  }
}

Write-Host '  [3/6] Remote-control services and programs' -ForegroundColor Gray
foreach ($s in (Get-CimInstance Win32_Service)) {
  $hay = "$($s.Name) $($s.DisplayName) $($s.PathName)".ToLower()
  if ($hay -match $remoteTools -or $s.Name -eq 'sshd' -or $s.Name -eq 'TermService' -or $s.Name -eq 'WinRM') {
    Emit @('SERVICE', $s.Name, $s.State, $s.StartMode, $s.PathName)
  }
}
foreach ($p in $procs.Values) {
  $name = [string]$p.Name
  $path = [string]$p.ExecutablePath
  $lower = "$name $path".ToLower()
  $oddPlace = $lower -match '\\appdata\\local\\temp\\|\\windows\\temp\\|\\users\\public\\|\\downloads\\|\\appdata\\roaming\\[^\\]+\.exe$|\\programdata\\[^\\]+\.exe$|\\perflogs\\|\\\$recycle\.bin\\'
  if ($lower -match $remoteTools -or ($oddPlace -and $netPids.ContainsKey([int]$p.ProcessId))) {
    Emit @('PROC', $name, $p.ProcessId, $path)
  }
}

Write-Host '  [4/6] Programs that start automatically' -ForegroundColor Gray
$runKeys = @(
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\RunOnce',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run',
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce'
)
foreach ($key in $runKeys) {
  $item = Get-ItemProperty $key
  if (-not $item) { continue }
  foreach ($prop in $item.PSObject.Properties) {
    if ($prop.Name -like 'PS*') { continue }
    Emit @('AUTORUN', $key, $prop.Name, $prop.Value)
  }
}
$startupDirs = @([Environment]::GetFolderPath('Startup'), [Environment]::GetFolderPath('CommonStartup'))
foreach ($dir in $startupDirs) {
  if (-not $dir) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $dir -File)) { Emit @('AUTORUN', 'StartupFolder', $f.Name, $f.FullName) }
}
foreach ($t in (Get-ScheduledTask | Where-Object { $_.TaskPath -notlike '\Microsoft\*' -and $_.State -ne 'Disabled' })) {
  foreach ($a in $t.Actions) {
    if ($a.Execute) { Emit @('TASK', "$($t.TaskPath)$($t.TaskName)", "$($a.Execute) $($a.Arguments)".Trim()) }
  }
}

Write-Host '  [5/6] Administrator accounts' -ForegroundColor Gray
$admins = Get-LocalGroupMember -SID 'S-1-5-32-544'
if ($admins) {
  foreach ($a in $admins) { Emit @('ADMIN', $a.Name, $a.PrincipalSource) }
}
else {
  $lines = net localgroup administrators 2>$null
  $take = $false
  foreach ($l in $lines) {
    if ($l -match '^-{5,}') { $take = $true; continue }
    if ($take -and $l -and $l -notmatch 'command completed') { Emit @('ADMIN', $l.Trim(), '') }
  }
}

Write-Host '  [6/6] Antivirus status' -ForegroundColor Gray
$mp = Get-MpComputerStatus
if ($mp) {
  Emit @('AV', 'defender_realtime', $(if ($mp.RealTimeProtectionEnabled) { 1 } else { 0 }))
  Emit @('AV', 'defender_antivirus', $(if ($mp.AntivirusEnabled) { 1 } else { 0 }))
}
$pref = Get-MpPreference
if ($pref) {
  foreach ($x in @($pref.ExclusionPath) + @($pref.ExclusionProcess)) {
    if ($x -and $x -notmatch 'N/A') { Emit @('AV', 'exclusion', $x) }
  }
}

$seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 1)
Emit @('INFO', 'seconds', $seconds)

# --- Quick summary in the console. The full read happens on packetcheck.net. ---
$listen = @($out | Where-Object { $_ -like "LISTEN`t*" })
$conns = @($out | Where-Object { $_ -like "CONN`t*" })
$notes = New-Object System.Collections.Generic.List[string]
$rdpOn = $out -contains "RDP`tenabled`t1"
if ($rdpOn) { $notes.Add('Remote Desktop is switched ON. If you did not turn it on, turn it off.') }
foreach ($s in ($out | Where-Object { $_ -like "SESSION`t*" })) {
  if ($s -match 'rdp-tcp#\d+' -and $s -match 'Active') { $notes.Add("Someone is signed in over Remote Desktop right now: $($s.Split("`t")[1])") }
}
$tools = @($out | Where-Object { $_ -like "PROC`t*" -or $_ -like "SERVICE`t*" } | ForEach-Object { $_.Split("`t")[1] } | Where-Object { $_.ToLower() -match $remoteTools } | Sort-Object -Unique)
if ($tools.Count -gt 0) { $notes.Add("Remote-control software found: $($tools -join ', ')") }

Write-Host ''
Write-Host "  Done in $seconds s. $($listen.Count) open ports, $($conns.Count) live connections." -ForegroundColor Green
if ($notes.Count -eq 0) {
  Write-Host '  No obvious remote access spotted in the quick check.' -ForegroundColor Green
}
else {
  foreach ($n in $notes) { Write-Host "  ! $n" -ForegroundColor Yellow }
}

$desktop = [Environment]::GetFolderPath('Desktop')
if (-not $desktop) { $desktop = $env:TEMP }
$file = Join-Path $desktop 'packetcheck-report.txt'
$out | Set-Content -Path $file -Encoding UTF8
$copied = $false
try { $out -join "`r`n" | Set-Clipboard; $copied = $true } catch { }

Write-Host ''
Write-Host "  Report saved to: $file" -ForegroundColor Gray
if ($copied) { Write-Host '  It is also on your clipboard.' -ForegroundColor Gray }
Write-Host '  Paste it at https://packetcheck.net/#check for the full free read.' -ForegroundColor Green
Write-Host ''
