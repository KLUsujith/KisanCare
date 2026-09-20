param()

$ErrorActionPreference = "Stop"
$destZip = "public\KisanCare-SourceCode.zip"
$staging = ".\_zip_staging"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
}

New-Item -ItemType Directory -Path $staging -Force | Out-Null

$excludeList = @("node_modules", ".git", "dist", "public", "_zip_staging", "*.zip", "create_zip.ps1")

Get-ChildItem -Path . | Where-Object {
    $name = $_.Name
    $exclude = $false
    foreach ($ex in $excludeList) {
        if ($name -like $ex) {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $staging -Recurse -Force
}

# Copy public folder contents except zip
New-Item -ItemType Directory -Path (Join-Path $staging "public") -Force | Out-Null
Get-ChildItem -Path "public" | Where-Object { $_.Name -notlike "*.zip" } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $staging "public") -Recurse -Force
}

Compress-Archive -Path "$staging\*" -DestinationPath $destZip -Force
Remove-Item -Path $staging -Recurse -Force

$zipFile = Get-Item $destZip
Write-Output "SUCCESS: Created $destZip ($([math]::Round($zipFile.Length / 1MB, 2)) MB)"
