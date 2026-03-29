# Updates the Docker Hub repository description for sddmhossain/testrium
# Usage: .\push-dockerhub-description.ps1

$Username = "sddmhossain"
$Repo = "testrium"

$Password = Read-Host "Docker Hub Password or Access Token" -AsSecureString
$PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
)

# Authenticate
Write-Host "Authenticating..."
$LoginBody = @{ username = $Username; password = $PlainPassword } | ConvertTo-Json
$LoginResponse = Invoke-RestMethod -Uri "https://hub.docker.com/v2/users/login" `
    -Method POST -ContentType "application/json" -Body $LoginBody

$Token = $LoginResponse.token
if (-not $Token) {
    Write-Host "Login failed. Check your credentials."
    exit 1
}
Write-Host "Authenticated."

# Read full description from file
$FullDesc = Get-Content -Path "dockerhub-description.md" -Raw

$ShortDesc = "Modern Test Case Management System for QA teams — Spring Boot + React, runs in minutes with Docker."

# Update repository
Write-Host "Updating Docker Hub description..."
$UpdateBody = @{
    description      = $ShortDesc
    full_description = $FullDesc
} | ConvertTo-Json -Depth 5

$Response = Invoke-RestMethod `
    -Uri "https://hub.docker.com/v2/repositories/$Username/$Repo/" `
    -Method PATCH `
    -Headers @{ Authorization = "Bearer $Token" } `
    -ContentType "application/json" `
    -Body $UpdateBody

Write-Host "Done! Visit: https://hub.docker.com/r/$Username/$Repo"
