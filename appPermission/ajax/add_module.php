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
    error_log("add_module missing database connection");
    authJsonFail("Unable to save application.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 20);

#region Initialize Variable
$modName = NULL;
if (!empty($_POST['modName'])) {
    $modName = trim($_POST['modName']);
}
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = filter_var($_POST['projID'], FILTER_VALIDATE_INT);
}

if ($modName === NULL || $modName === '') {
    authJsonFail("Module name is required.");
}
if ($projID === false || $projID === NULL || (int)$projID <= 0) {
    authJsonFail("Selected application was not found.");
}
$projID = (int)$projID;

$projQ = "SELECT project_id FROM kdtwebprojects WHERE project_id = :projID LIMIT 1";
$projStmt = $connkdt->prepare($projQ);
$projStmt->execute([":projID" => $projID]);
if ($projStmt->fetchColumn() === false) {
    authJsonFail("Selected application was not found.");
}

$dupQ = "SELECT module_id FROM kdtproject_modules WHERE project_id = :projID AND module_name = :modName LIMIT 1";
$dupStmt = $connkdt->prepare($dupQ);
$dupStmt->execute([":projID" => $projID, ":modName" => $modName]);
if ($dupStmt->fetchColumn() !== false) {
    authJsonFail("Duplicate module name.");
}
#endregion

#region Entries Query
try {
    $modQ = "INSERT INTO kdtproject_modules(project_id,module_name) VALUES (:projID,:modName)";
    $modStmt = $connkdt->prepare($modQ);
    if ($modStmt === false || $modStmt->execute([":projID" => $projID, ":modName" => $modName]) === false) {
        $errInfo = $modStmt ? $modStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate module name.");
        }
        error_log("add_module mutation failed");
        authJsonFail("Unable to save application.");
    }
} catch (Exception $e) {
    error_log("add_module mutation failed");
    authJsonFail("Unable to save application.");
}

#endregion

echo json_encode(false);
