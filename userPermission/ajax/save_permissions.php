<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 19);

#region Initialize Variable
$empID = NULL;
if (!empty($_POST['empID'])) {
    $empID = filter_var($_POST['empID'], FILTER_VALIDATE_INT);
}
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = filter_var($_POST['projID'], FILTER_VALIDATE_INT);
}
$perm = array();
if (isset($_POST['perm'])) {
    $perm = $_POST['perm'];
}

if ($empID === false || $empID === NULL || (int)$empID <= 0) {
    authJsonFail("Unable to update permissions.");
}
$empID = (int)$empID;

if ($projID === false || $projID === NULL || (int)$projID <= 0) {
    authJsonFail("Unable to update permissions.");
}
$projID = (int)$projID;

if (!is_array($perm)) {
    authJsonFail("Unable to update permissions.");
}

$normalizedPerm = array();
foreach ($perm as $postedPerm) {
    $permID = filter_var($postedPerm, FILTER_VALIDATE_INT);
    if ($permID === false || (int)$permID <= 0) {
        authJsonFail("Unable to update permissions.");
    }
    $normalizedPerm[] = (int)$permID;
}
$perm = $normalizedPerm;

if (!targetEmployeeExists($empID)) {
    authJsonFail("Unable to update permissions.");
}
if (!projectExists($projID)) {
    authJsonFail("Unable to update permissions.");
}

$allowedPermIds = getProjectPermissionIds($projID);
$submittedNotAllowed = array_diff($perm, $allowedPermIds);
if (!empty($submittedNotAllowed)) {
    authJsonFail("Unable to update permissions.");
}

$currentPerm = array();
$permissionsQ = "SELECT GROUP_CONCAT(up.permission_id) FROM `emp_prof` AS ep JOIN user_permissions AS up ON ep.fldEmployeeNum=up.fldEmployeeNum JOIN p_permissions AS p ON up.permission_id = p.permission_id JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON km.project_id=kp.project_id WHERE ep.fldEmployeeNum= :empID AND kp.project_id = :projID";
$permissionsStmt = $connkdt->prepare($permissionsQ);
$permissionsStmt->execute([":empID" => $empID, ":projID" => $projID]);
if ($permissionsStmt->rowCount() > 0) {
    $permissions = $permissionsStmt->fetchColumn();
    if ($permissions) {
        $currentPerm = array_map('intval', explode(',', $permissions ?? ''));
    }
}
$newPermissions = array_diff($perm, $currentPerm);
$removePermissions = array();
foreach ($currentPerm as $cur) {
    if (!in_array($cur, $perm, true)) {
        $removePermissions[] = $cur;
    }
}
#endregion

#region Entries Query
$connDisable->beginTransaction();
$removeQ = "DELETE FROM user_permissions WHERE fldEmployeeNum = :empID AND permission_id = :permID";
$removeStmt = $connDisable->prepare($removeQ);
$addQ = "INSERT INTO user_permissions(permission_id,fldEmployeeNum) VALUES (:permID,:empID)";
$addStmt = $connDisable->prepare($addQ);

try {
    foreach ($removePermissions as $rmp) {
        $removeStmt->execute([":empID" => $empID, ":permID" => $rmp]);
    }
    foreach ($newPermissions as $nmp) {
        $addStmt->execute([":empID" => $empID, ":permID" => $nmp]);
    }
    $connDisable->commit();
} catch (Exception $e) {
    $connDisable->rollBack();
    error_log("save_permissions mutation failed");
    authJsonFail("Unable to update permissions.");
}

#endregion

echo json_encode(false);

#region Functions
function targetEmployeeExists($empID)
{
    global $connkdt;
    $empQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldEmployeeNum = :empID LIMIT 1";
    $empStmt = $connkdt->prepare($empQ);
    $empStmt->execute([":empID" => $empID]);
    return $empStmt->fetchColumn() !== false;
}

function projectExists($projID)
{
    global $connkdt;
    $projQ = "SELECT project_id FROM kdtwebprojects WHERE project_id = :projID LIMIT 1";
    $projStmt = $connkdt->prepare($projQ);
    $projStmt->execute([":projID" => $projID]);
    return $projStmt->fetchColumn() !== false;
}

function getProjectPermissionIds($projID)
{
    global $connkdt;
    $allowed = array();
    $permQ = "SELECT p.permission_id FROM p_permissions AS p JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON kp.project_id=km.project_id WHERE kp.project_id = :projID";
    $permStmt = $connkdt->prepare($permQ);
    $permStmt->execute([":projID" => $projID]);
    if ($permStmt->rowCount() > 0) {
        $permArr = $permStmt->fetchAll();
        foreach ($permArr as $row) {
            $allowed[] = (int)$row['permission_id'];
        }
    }
    return $allowed;
}
#endregion
