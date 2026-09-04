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
    error_log("get_permissions missing database connection");
    authJsonFail("Unable to load permissions.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 18);

#region Initialize Variable
$empID = NULL;
if (!empty($_POST['empID'])) {
    $empID = filter_var($_POST['empID'], FILTER_VALIDATE_INT);
}
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = filter_var($_POST['projID'], FILTER_VALIDATE_INT);
}
$permissionsArray = array();
#endregion

#region Entries Query
if ($empID !== false && $empID !== NULL && (int)$empID > 0 && $projID !== false && $projID !== NULL && (int)$projID > 0) {
    $empID = (int)$empID;
    $projID = (int)$projID;
    $permissionsQ = "SELECT GROUP_CONCAT(up.permission_id) FROM `emp_prof` AS ep JOIN user_permissions AS up ON ep.fldEmployeeNum=up.fldEmployeeNum JOIN p_permissions AS p ON up.permission_id = p.permission_id JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON km.project_id=kp.project_id WHERE ep.fldEmployeeNum= :empID AND kp.project_id = :projID";
    $permissionsStmt = $connkdt->prepare($permissionsQ);
    $permissionsStmt->execute([":empID" => $empID, ":projID" => $projID]);
    if ($permissionsStmt->rowCount() > 0) {
        $permissions = $permissionsStmt->fetchColumn();
        if ($permissions) {
            $permissionsArray = explode(',', $permissions ?? '');
        }
    }
}
#endregion

echo json_encode($permissionsArray, JSON_PRETTY_PRINT);
