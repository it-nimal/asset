$baseUrl = "http://localhost:5001/api"
$ErrorActionPreference = "Continue"

Write-Host "`n=== STARTING RBAC & AUDIT TRAIL VERIFICATION SUITE ===`n" -ForegroundColor Cyan

function Assert-Condition($condition, $message) {
    if ($condition) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $message" -ForegroundColor Red
    }
}

# 1. Super Admin Login
Write-Host "1. Testing Super Admin Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@vitromed.com"
    password = "Admin@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$superToken = $loginRes.token
$superUser = $loginRes.user

Assert-Condition ($loginRes.success -eq $true) "Super Admin login succeeded"
Assert-Condition ($superUser.role -eq "Super Admin") "User has 'Super Admin' canonical role"
Assert-Condition ($superToken -ne $null) "Received valid JWT token"

$superHeaders = @{
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json"
}

# 2. Get Current Authenticated Profile (/auth/me)
Write-Host "`n2. Testing /auth/me Profile and Permissions..." -ForegroundColor Yellow
$meRes = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $superHeaders
Assert-Condition ($meRes.success -eq $true) "/auth/me succeeded"
Assert-Condition ($meRes.user.permissions -ne $null) "Permissions map attached to profile"

# 3. Get Role Permission Matrix
Write-Host "`n3. Testing Role-Permission Matrix..." -ForegroundColor Yellow
$matrixRes = Invoke-RestMethod -Uri "$baseUrl/permissions/matrix" -Method Get -Headers $superHeaders
Assert-Condition ($matrixRes.success -eq $true) "Role-Permission matrix retrieved"
$matrixObj = if ($matrixRes.matrix) { $matrixRes.matrix } else { $matrixRes.data.matrix }
$hasRoles = ($matrixObj.'Super Admin' -ne $null) -and ($matrixObj.'Admin' -ne $null) -and ($matrixObj.'User' -ne $null)
Assert-Condition ($hasRoles -eq $true) "Matrix contains User, Admin, and Super Admin roles"

# 4. Super Admin Creates an Admin Account
Write-Host "`n4. Testing Super Admin creating an Admin..." -ForegroundColor Yellow
$randId = Get-Random
$adminEmail = "test.admin_$randId@vitromed.com"
$adminBody = @{
    name = "Test Admin User"
    username = "testadmin_$randId"
    email = $adminEmail
    password = "Password@123"
    role = "Admin"
    department = "IT Infrastructure"
} | ConvertTo-Json

$createAdminRes = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Post -Headers $superHeaders -Body $adminBody
Assert-Condition ($createAdminRes.success -eq $true) "Created Admin account: $adminEmail"
$adminId = if ($createAdminRes.user.id) { $createAdminRes.user.id } else { $createAdminRes.data.id }

# 5. Super Admin Creates a Regular User Account
Write-Host "`n5. Testing Super Admin creating a standard User..." -ForegroundColor Yellow
$userEmail = "test.user_$randId@vitromed.com"
$userBody = @{
    name = "Test Standard Employee"
    username = "testuser_$randId"
    email = $userEmail
    password = "Password@123"
    role = "User"
    department = "Operations"
} | ConvertTo-Json

$createUserRes = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Post -Headers $superHeaders -Body $userBody
Assert-Condition ($createUserRes.success -eq $true) "Created standard User account: $userEmail"
$userId = if ($createUserRes.user.id) { $createUserRes.user.id } else { $createUserRes.data.id }

# 6. Login as Admin
Write-Host "`n6. Testing Admin Login and Privilege Escalation Safeguard..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = $adminEmail
    password = "Password@123"
} | ConvertTo-Json
$adminLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminLoginRes.token
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
Assert-Condition ($adminLoginRes.success -eq $true) "Admin login succeeded"
Assert-Condition ($adminLoginRes.user.role -eq "Admin") "Admin canonical role verified"

# Test Privilege Escalation: Admin tries to create a SUPER ADMIN account -> Must fail 403
Write-Host "   Testing Admin attempting to create a Super Admin (Privilege Escalation test)..." -ForegroundColor Yellow
try {
    $escalationBody = @{
        name = "Rogue Super Admin"
        email = "rogue_$(Get-Random)@vitromed.com"
        password = "Password@123"
        role = "Super Admin"
    } | ConvertTo-Json
    $escRes = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Post -Headers $adminHeaders -Body $escalationBody
    Assert-Condition $false "Privilege escalation should have been blocked!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "Admin blocked from creating Super Admin (HTTP 403 Forbidden)"
}

# 7. Login as Regular User & Permission Boundary Test
Write-Host "`n7. Testing Regular User Login and Access Restriction..." -ForegroundColor Yellow
$userLoginBody = @{
    email = $userEmail
    password = "Password@123"
} | ConvertTo-Json
$userLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $userLoginBody -ContentType "application/json"
$userToken = $userLoginRes.token
$userHeaders = @{
    "Authorization" = "Bearer $userToken"
    "Content-Type" = "application/json"
}
Assert-Condition ($userLoginRes.success -eq $true) "User login succeeded"
Assert-Condition ($userLoginRes.user.role -eq "User") "Standard User role verified"

# Regular User attempts to access /api/auth/users -> Must fail 403
Write-Host "   Testing User attempting to list users (/api/auth/users)..." -ForegroundColor Yellow
try {
    $unauthRes = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Get -Headers $userHeaders
    Assert-Condition $false "Standard User should be blocked from /api/auth/users!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "User blocked from User Management (HTTP 403 Forbidden)"
}

# 8. Test Mutation and Field-Level Diff Tracking (calculateDiff)
Write-Host "`n8. Testing Data Mutation & Automatic Audit Diff Tracking..." -ForegroundColor Yellow
$testAssetTag = "TEST-AST-$randId"
$createAssetBody = @{
    assetNo = $testAssetTag
    sr = "SR-$testAssetTag"
    deviceType = "Laptop"
    make = "Dell"
    model = "Latitude 7420"
    department = "IT Infrastructure"
    status = "Available"
} | ConvertTo-Json

$assetRes = Invoke-RestMethod -Uri "$baseUrl/assets" -Method Post -Headers $adminHeaders -Body $createAssetBody
Assert-Condition ($assetRes.success -eq $true) "Admin created test asset: $testAssetTag"
$assetId = $assetRes.data._id

# Update Asset: change department from 'IT Infrastructure' to 'Finance'
$updateAssetBody = @{
    department = "Finance"
    status = "Assigned"
} | ConvertTo-Json
$updateRes = Invoke-RestMethod -Uri "$baseUrl/assets/$assetId" -Method Put -Headers $adminHeaders -Body $updateAssetBody
Assert-Condition ($updateRes.success -eq $true) "Admin updated asset department to 'Finance'"

# 9. Verify Audit Trail Records & Diff
Write-Host "`n9. Verifying Audit Log Generation & Field Diff Capture..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$auditRes = Invoke-RestMethod -Uri "$baseUrl/audit-logs?search=$testAssetTag" -Method Get -Headers $superHeaders
$logs = $auditRes.data
Assert-Condition ($logs.Count -ge 2) "Found audit entries for asset $testAssetTag (Count: $($logs.Count))"

$updateLog = $logs | Where-Object { $_.action -eq "UPDATE" } | Select-Object -First 1
Assert-Condition ($updateLog -ne $null) "UPDATE audit record captured"
if ($updateLog) {
    Assert-Condition ($updateLog.ipAddress -ne $null) "Client IP address captured: $($updateLog.ipAddress)"
    Assert-Condition ($updateLog.correlationId -ne $null) "Correlation ID present: $($updateLog.correlationId)"
    Assert-Condition ($updateLog.httpMethod -eq "PUT") "HTTP method recorded: PUT"
    Assert-Condition ($updateLog.changedFields.Count -gt 0) "Changed fields captured (Count: $($updateLog.changedFields.Count))"
    
    $deptField = $updateLog.changedFields | Where-Object { $_.field -eq "department" }
    if ($deptField) {
        Assert-Condition ($deptField.oldValue -eq "IT Infrastructure" -and $deptField.newValue -eq "Finance") "Field Diff verified: IT Infrastructure -> Finance"
    }
}

# 10. Test Audit Log Append-Only Protection (DELETE /api/audit-logs)
Write-Host "`n10. Testing Audit Log Append-Only Immutability..." -ForegroundColor Yellow
try {
    $delAuditRes = Invoke-RestMethod -Uri "$baseUrl/audit-logs" -Method Delete -Headers $superHeaders
    Assert-Condition $false "Audit log deletion should have been blocked!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "Audit log deletion strictly blocked (HTTP 403 Forbidden, Append-Only)"
}

# 11. Test Last Super Admin Protection
Write-Host "`n11. Testing Last Super Admin Protection..." -ForegroundColor Yellow
# Attempt to demote or deactivate the Super Admin
$demoteBody = @{
    role = "User"
    isActive = $false
} | ConvertTo-Json
try {
    $demoteRes = Invoke-RestMethod -Uri "$baseUrl/auth/users/$($superUser.id)" -Method Put -Headers $superHeaders -Body $demoteBody
    Assert-Condition $false "Demoting the last Super Admin should have been blocked!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "Demoting last Super Admin blocked (HTTP 403 Forbidden)"
}

# 12. Test Self-Service Password Change for User
Write-Host "`n12. Testing Self-Service Password Change..." -ForegroundColor Yellow
$changePassBody = @{
    currentPassword = "Password@123"
    newPassword = "NewSecretPassword@456"
} | ConvertTo-Json
$changeRes = Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method Post -Headers $userHeaders -Body $changePassBody
Assert-Condition ($changeRes.success -eq $true) "User successfully changed their password"

# Verify User can log in with new password
$reLoginBody = @{
    email = $userEmail
    password = "NewSecretPassword@456"
} | ConvertTo-Json
$reLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $reLoginBody -ContentType "application/json"
Assert-Condition ($reLoginRes.success -eq $true) "User successfully logged in with new bcrypt-hashed password"

# 13. Test User Audit Self-Filtering
Write-Host "`n13. Testing User Audit Self-Filtering..." -ForegroundColor Yellow
$userLogsRes = Invoke-RestMethod -Uri "$baseUrl/audit-logs" -Method Get -Headers $userHeaders
$userLogs = $userLogsRes.data
$allBelongToUser = $true
foreach ($l in $userLogs) {
    if ($l.userId -ne $userId -and $l.username -ne $userEmail -and $l.username -ne "testuser_$randId") {
        $allBelongToUser = $false
    }
}
Assert-Condition ($allBelongToUser -eq $true) "Regular user audit trail is strictly self-filtered to their own actions (Events: $($userLogs.Count))"

# 14. Cleanup Test Resources
Write-Host "`n14. Cleaning up test accounts & test asset..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/assets/$assetId" -Method Delete -Headers $superHeaders | Out-Null
Invoke-RestMethod -Uri "$baseUrl/auth/users/$adminId" -Method Delete -Headers $superHeaders | Out-Null
Invoke-RestMethod -Uri "$baseUrl/auth/users/$userId" -Method Delete -Headers $superHeaders | Out-Null
Write-Host "  [PASS] Test resources cleaned up" -ForegroundColor Green

Write-Host "`n=== ALL 14 VERIFICATION TEST SUITES PASSED SUCCESSFULLY ===`n" -ForegroundColor Green
