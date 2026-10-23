# Sends one test item per section to the ingest endpoint for 2000-01-01.
# The token is read as hidden input and is not stored. Delete the test rows afterwards.
$ErrorActionPreference = "Stop"

$endpoint = "https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/ingest"
$testDate = "2000-01-01"

$secure = Read-Host "INGEST_TOKEN" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
$headers = @{ Authorization = "Bearer $token" }

function Send-Payload($name, $payload) {
  $body = $payload | ConvertTo-Json -Depth 6
  try {
    $response = Invoke-WebRequest -Uri $endpoint -Method Post -Headers $headers -ContentType "application/json" `
      -Body ([Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing
    Write-Host "$name -> $($response.StatusCode) $($response.Content)"
  } catch {
    $res = $_.Exception.Response
    if (-not $res) { throw }
    $reader = New-Object IO.StreamReader($res.GetResponseStream())
    Write-Host "$name -> $([int]$res.StatusCode) $($reader.ReadToEnd())"
  }
}

Send-Payload "interview" @{
  schemaVersion = "v1"; section = "interview"; digestDate = $testDate
  items = @(@{
    topic = "Smoke test"; difficulty = "easy"; question = "Does ingestion work?"; answer = "Yes."
    answerOrigin = "ai_generated"; sourceRepository = "test/repo"; sourceUrl = "https://github.com/test/repo"
  })
}

Send-Payload "news" @{
  schemaVersion = "v1"; section = "news"; digestDate = $testDate
  items = @(
    @{ title = "Test one"; url = "https://example.com/1"; publisher = "Test"; category = "ai"; summary = "First."; publishedAt = "2000-01-01T00:00:00Z" },
    @{ title = "Test two"; url = "https://example.com/2"; publisher = "Test"; category = "data_engineering"; summary = "Second."; publishedAt = "2000-01-01T00:00:00Z" }
  )
}

Send-Payload "de_topic" @{
  schemaVersion = "v1"; section = "de_topic"; digestDate = $testDate
  items = @(@{ title = "Smoke test"; explanation = "Explanation."; practicalExample = "select 1;"; referenceUrls = @("https://example.com/doc") })
}

Send-Payload "trending" @{
  schemaVersion = "v1"; section = "trending"; digestDate = $testDate
  items = @(@{ fullName = "test/repo"; url = "https://github.com/test/repo"; description = $null; language = "Go"; stars = 1 })
}

Send-Payload "invalid (expect 400)" @{
  schemaVersion = "v1"; section = "news"; digestDate = $testDate
  items = @(@{ title = "Bad"; url = "not-a-url"; publisher = "Test"; category = "sports"; summary = "x"; publishedAt = "yesterday" })
}
