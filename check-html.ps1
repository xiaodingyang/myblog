$r = Invoke-WebRequest -Uri 'https://www.xiaodingyang.art/' -UseBasicParsing -TimeoutSec 10
$r.Content.Substring(0, [Math]::Min(3000, $r.Content.Length))
