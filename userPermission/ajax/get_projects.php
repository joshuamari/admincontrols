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
    error_log("get_projects missing database connection");
    authJsonFail("Unable to load projects.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 18);

#region Initialize Variable
$projectsArray = array();
#endregion

#region Entries Query
$permissionQ = "SELECT kp.project_name,kp.project_id,km.module_name,km.module_id,p.permission_name,p.permission_id FROM  p_permissions AS p JOIN kdtproject_modules AS km ON p.module_id=km.module_id JOIN kdtwebprojects AS kp ON kp.project_id=km.project_id ORDER BY kp.project_id,km.module_id,p.permission_id";
$permissionStmt = $connkdt->query($permissionQ);
if ($permissionStmt !== false && $permissionStmt->rowCount() > 0) {
    $permissionArr = $permissionStmt->fetchAll();
    foreach ($permissionArr as $perm) {
        $projID = (int)$perm['project_id'];
        $projName = $perm['project_name'];
        $modID = (int)$perm['module_id'];
        $modName = $perm['module_name'];
        $permID = (int)$perm['permission_id'];
        $permName = $perm['permission_name'];
        $projectsArray[$projID]['project_name'] = $projName;
        $projectsArray[$projID]['modules'][$modName][$permID] = $permName;
    }
}
#endregion

echo json_encode($projectsArray, JSON_PRETTY_PRINT);
