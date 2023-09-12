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
$permissionsArray = array();
#endregion

#region Entries Query
$permissionsQ = "SELECT GROUP_CONCAT(up.permission_id) FROM `emp_prof` AS ep JOIN user_permissions AS up ON ep.fldEmployeeNum=up.fldEmployeeNum JOIN p_permissions AS p ON up.permission_id = p.permission_id JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON km.project_id=kp.project_id WHERE ep.fldEmployeeNum= :empID AND kp.project_id = :projID";
$permissionsStmt = $connkdt->prepare($permissionsQ);
$permissionsStmt->execute([":empID" => $empID, ":projID" => $projID]);
if ($permissionsStmt->rowCount() > 0) {
    $permissions = $permissionsStmt->fetchColumn();
    if ($permissions) {
        $permissionsArray = explode(',', $permissions ?? '');
    }
}
#endregion

echo json_encode($permissionsArray, JSON_PRETTY_PRINT);
