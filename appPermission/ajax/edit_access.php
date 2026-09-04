<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("edit_access missing database connection");
    authJsonFail("Unable to save application.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 20);

$accName = NULL;
if (!empty($_POST['accName'])) {
    $accName = trim($_POST['accName']);
}
$permID = NULL;
if (!empty($_POST['permID'])) {
    $permID = filter_var($_POST['permID'], FILTER_VALIDATE_INT);
}

if ($accName === NULL || $accName === '') {
    authJsonFail("Permission name is required.");
}
if ($permID === false || $permID === NULL || (int)$permID <= 0) {
    authJsonFail("Selected permission was not found.");
}
$permID = (int)$permID;

$permQ = "SELECT p.permission_id, p.permission_name, p.module_id, km.module_name, km.project_id
          FROM p_permissions AS p
          JOIN kdtproject_modules AS km ON p.module_id = km.module_id
          WHERE p.permission_id = :permID
          LIMIT 1";
$permStmt = $connkdt->prepare($permQ);
$permStmt->execute([":permID" => $permID]);
$permRow = $permStmt->fetch();
if ($permRow === false) {
    authJsonFail("Selected permission was not found.");
}

$oldName = $permRow['permission_name'];
$modID = (int)$permRow['module_id'];
$modName = $permRow['module_name'];
$projID = (int)$permRow['project_id'];

if ($accName === $oldName) {
    echo json_encode(false);
    exit;
}

$dupQ = "SELECT permission_id FROM p_permissions WHERE module_id = :modID AND permission_name = :accName AND permission_id <> :permID LIMIT 1";
$dupStmt = $connkdt->prepare($dupQ);
$dupStmt->execute([":modID" => $modID, ":accName" => $accName, ":permID" => $permID]);
if ($dupStmt->fetchColumn() !== false) {
    authJsonFail("Duplicate permission name.");
}

try {
    $updateQ = "UPDATE p_permissions SET permission_name = :accName WHERE permission_id = :permID";
    $updateStmt = $connkdt->prepare($updateQ);
    if ($updateStmt === false || $updateStmt->execute([":accName" => $accName, ":permID" => $permID]) === false) {
        $errInfo = $updateStmt ? $updateStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate permission name.");
        }
        error_log("edit_access mutation failed");
        authJsonFail("Unable to save application.");
    }
} catch (Exception $e) {
    error_log("edit_access mutation failed");
    authJsonFail("Unable to save application.");
}

if ($projID > 0) {
    audit_log($actorEmpNum, "UPDATE", "app_permission", $projID, null, [
        "event_type" => "PERMISSION_RENAMED",
        "description" => "Permission name updated",
        "details" => [
            "module_id" => $modID,
            "module_name" => $modName,
            "permission_id" => $permID,
            "old_value" => $oldName,
            "new_value" => $accName,
        ],
    ]);
}

echo json_encode(false);
