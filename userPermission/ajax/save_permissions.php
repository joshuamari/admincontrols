<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$empID = NULL;
if (!empty($_POST['empID'])) {
    $empID = $_POST['empID'];
}
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = $_POST['projID'];
}
$perm = array();
if (!empty($_POST['perm'])) {
    $perm = $_POST['perm'];
}
$currentPerm = array();
$permissionsQ = "SELECT GROUP_CONCAT(up.permission_id) FROM `emp_prof` AS ep JOIN user_permissions AS up ON ep.fldEmployeeNum=up.fldEmployeeNum JOIN p_permissions AS p ON up.permission_id = p.permission_id JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON km.project_id=kp.project_id WHERE ep.fldEmployeeNum= :empID AND kp.project_id = :projID";
$permissionsStmt = $connkdt->prepare($permissionsQ);
$permissionsStmt->execute([":empID" => $empID, ":projID" => $projID]);
if ($permissionsStmt->rowCount() > 0) {
    $permissions = $permissionsStmt->fetchColumn();
    if ($permissions) {
        $currentPerm = explode(',', $permissions ?? '');
    }
}
$newPermissions = array_diff($perm, $currentPerm);
$removePermissions = array();
foreach ($currentPerm as $cur) {
    if (!in_array($cur, $perm)) {
        $removePermissions[] = $cur;
    }
}
$err = FALSE;
$connDisable->beginTransaction();

$removeQ = "DELETE FROM user_permissions WHERE fldEmployeeNum = :empID AND permission_id = :permID";
$removeStmt = $connDisable->prepare($removeQ);
$addQ = "INSERT INTO user_permissions(permission_id,fldEmployeeNum) VALUES (:permID,:empID)";
$addStmt = $connDisable->prepare($addQ);
#endregion

#region Entries Query
try {
    if (!empty($removePermissions)) {
        foreach ($removePermissions as $rmp) {
            //deletemoto
            $removeStmt->execute([":empID" => $empID, ":permID" => $rmp]);
        }
    }
    if (!empty($newPermissions)) {
        foreach ($newPermissions as $nmp) {
            //addmoto
            $addStmt->execute([":empID" => $empID, ":permID" => $nmp]);
        }
    }
    $connDisable->commit();
} catch (Exception $e) {
    $err = $e;
    $connDisable->rollBack();
}

#endregion

echo json_encode($err, JSON_PRETTY_PRINT);
