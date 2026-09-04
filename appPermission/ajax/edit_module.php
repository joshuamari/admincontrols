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
    error_log("edit_module missing database connection");
    authJsonFail("Unable to save application.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 20);

$modName = NULL;
if (!empty($_POST['modName'])) {
    $modName = trim($_POST['modName']);
}
$modID = NULL;
if (!empty($_POST['modID'])) {
    $modID = filter_var($_POST['modID'], FILTER_VALIDATE_INT);
}

if ($modName === NULL || $modName === '') {
    authJsonFail("Module name is required.");
}
if ($modID === false || $modID === NULL || (int)$modID <= 0) {
    authJsonFail("Selected module was not found.");
}
$modID = (int)$modID;

$modQ = "SELECT module_id, module_name, project_id FROM kdtproject_modules WHERE module_id = :modID LIMIT 1";
$modStmt = $connkdt->prepare($modQ);
$modStmt->execute([":modID" => $modID]);
$modRow = $modStmt->fetch();
if ($modRow === false) {
    authJsonFail("Selected module was not found.");
}

$oldName = $modRow['module_name'];
$projID = (int)$modRow['project_id'];

if ($modName === $oldName) {
    echo json_encode(false);
    exit;
}

$dupQ = "SELECT module_id FROM kdtproject_modules WHERE project_id = :projID AND module_name = :modName AND module_id <> :modID LIMIT 1";
$dupStmt = $connkdt->prepare($dupQ);
$dupStmt->execute([":projID" => $projID, ":modName" => $modName, ":modID" => $modID]);
if ($dupStmt->fetchColumn() !== false) {
    authJsonFail("Duplicate module name.");
}

try {
    $updateQ = "UPDATE kdtproject_modules SET module_name = :modName WHERE module_id = :modID";
    $updateStmt = $connkdt->prepare($updateQ);
    if ($updateStmt === false || $updateStmt->execute([":modName" => $modName, ":modID" => $modID]) === false) {
        $errInfo = $updateStmt ? $updateStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate module name.");
        }
        error_log("edit_module mutation failed");
        authJsonFail("Unable to save application.");
    }
} catch (Exception $e) {
    error_log("edit_module mutation failed");
    authJsonFail("Unable to save application.");
}

if ($projID > 0) {
    audit_log($actorEmpNum, "UPDATE", "app_permission", $projID, null, [
        "event_type" => "MODULE_RENAMED",
        "description" => "Module name updated",
        "details" => [
            "module_id" => $modID,
            "old_value" => $oldName,
            "new_value" => $modName,
        ],
    ]);
}

echo json_encode(false);
