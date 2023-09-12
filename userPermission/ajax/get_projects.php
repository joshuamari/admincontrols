<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable

$projectsArray = array();
#endregion

#region Entries Query
$permissionQ = "SELECT kp.project_name,kp.project_id,km.module_name,km.module_id,p.permission_name,p.permission_id FROM  p_permissions AS p JOIN kdtwebprojects AS kp ON p.project_id=kp.project_id JOIN kdtproject_modules AS km ON p.module_id=km.module_id ORDER BY kp.project_id,km.module_id,p.permission_id";
$permissionStmt = $connkdt->query($permissionQ);
if ($permissionStmt->rowCount() > 0) {
    $permissionArr = $permissionStmt->fetchAll();
    foreach ($permissionArr as $perm) {
        $projID = $perm['project_id'];
        $projName = $perm['project_name'];
        $modID = $perm['module_id'];
        $modName = $perm['module_name'];
        $permID = $perm['permission_id'];
        $permName = $perm['permission_name'];
        $projectsArray[$projID]['project_name'] = $projName;
        $projectsArray[$projID]['modules'][$modName][$permID] = $permName;
    }
}
#endregion


echo json_encode($projectsArray, JSON_PRETTY_PRINT);
