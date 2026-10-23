# Runs the daily-digest Edge Function by hand.
#   Preview without saving:   .\scripts\daily-digest.ps1 -DryRun
#   Save today's content:      .\scripts\daily-digest.ps1
#   One section, given date:   .\scripts\daily-digest.ps1 -Section news -Date 2026-10-22
# The DIGEST_TOKEN is read as hidden input and is not stored.
param(
  [ValidateSet("all", "interview", "news", "de_topic", "trending")]
  [string]$Section = "all",
  [string]$Date,
  [switch]$DryRun
)
$ErrorActionPreference = "Stop"

$endpoint = "https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/daily-digest"
$sections = if ($Section -eq "all") { @("trending", "interview", "de_topic", "news") } else { @($Section) }

$secure = Read-Host "DIGEST_TOKEN" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

foreach ($name in $sections) {
  $body = @{ section = $name; dryRun = [bool]$DryRun }
  if ($Date) { $body.digestDate = $Date }
  $started = Get-Date
  try {
    $response = Invoke-WebRequest -Uri $endpoint -Method Post -Headers @{ Authorization = "Bearer $token" } `
      -ContentType "application/json" -Body ($body | ConvertTo-Json) -UseBasicParsing -TimeoutSec 180
    $status = $response.StatusCode
    $content = [Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray())
  } catch {
    $res = $_.Exception.Response
    if (-not $res) { throw }
    $status = [int]$res.StatusCode
    $content = (New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()
  }
  $seconds = [int]((Get-Date) - $started).TotalSeconds
  Write-Host ""
  Write-Host "=== $name -> $status (${seconds}s) ===" -ForegroundColor Cyan
  try { $content | ConvertFrom-Json | ConvertTo-Json -Depth 8 } catch { $content }
}
