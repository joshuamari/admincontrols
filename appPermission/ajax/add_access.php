<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("add_access missing database connection");
    authJsonFail("Unable to save application.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 20);

#region Initialize Variable
$accName = NULL;
if (!empty($_POST['accName'])) {
    $accName = trim($_POST['accName']);
}
$modID = NULL;
if (!empty($_POST['modID'])) {
    $modID = filter_var($_POST['modID'], FILTER_VALIDATE_INT);
}

if ($accName === NULL || $accName === '') {
    authJsonFail("Permission name is required.");
}
if ($modID === false || $modID === NULL || (int)$modID <= 0) {
    authJsonFail("Selected module was not found.");
}
$modID = (int)$modID;

$modQ = "SELECT module_id FROM kdtproject_modules WHERE module_id = :modID LIMIT 1";
$modStmt = $connkdt->prepare($modQ);
$modStmt->execute([":modID" => $modID]);
if ($modStmt->fetchColumn() === false) {
    authJsonFail("Selected module was not found.");
}

$dupQ = "SELECT permission_id FROM p_permissions WHERE module_id = :modID AND permission_name = :accName LIMIT 1";
$dupStmt = $connkdt->prepare($dupQ);
$dupStmt->execute([":modID" => $modID, ":accName" => $accName]);
if ($dupStmt->fetchColumn() !== false) {
    authJsonFail("Duplicate permission name.");
}
#endregion

#region Entries Query
try {
    $appQ = "INSERT INTO p_permissions(module_id,permission_name) VALUES (:modID,:accName)";
    $appStmt = $connkdt->prepare($appQ);
    if ($appStmt === false || $appStmt->execute([":accName" => $accName, ":modID" => $modID]) === false) {
        $errInfo = $appStmt ? $appStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate permission name.");
        }
        error_log("add_access mutation failed");
        authJsonFail("Unable to save application.");
    }
} catch (Exception $e) {
    error_log("add_access mutation failed");
    authJsonFail("Unable to save application.");
}

#endregion

echo json_encode(false);
