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
requirePermission($actorEmpNum, 20);

#region Initialize Variable
$projectsArray = array();
#endregion

#region Entries Query
$permissionQ = "SELECT kp.project_name,kp.project_id,kp.project_css_class,km.module_name,km.module_id,p.permission_name,p.permission_id FROM kdtwebprojects AS kp LEFT JOIN kdtproject_modules AS km ON kp.project_id=km.project_id LEFT JOIN p_permissions AS p ON km.module_id=p.module_id";
$permissionStmt = $connkdt->query($permissionQ);
if ($permissionStmt !== false && $permissionStmt->rowCount() > 0) {
    $permissionArr = $permissionStmt->fetchAll();
    foreach ($permissionArr as $perm) {
        $projID = (int)$perm['project_id'];
        $projName = $perm['project_name'];
        $projColor = $perm['project_css_class'];
        $modID = (int)$perm['module_id'];
        $modName = $perm['module_name'];
        $permID = (int)$perm['permission_id'];
        $permName = $perm['permission_name'];
        $projectsArray[$projName]['project_id'] = $projID;
        $projectsArray[$projName]['project_color'] = $projColor;
        if ($modID) {
            $projectsArray[$projName]['modules'][$modName]['module_id'] = $modID;
            if ($permID) {
                $projectsArray[$projName]['modules'][$modName]['permissions'][$permName] = $permID;
            } else {
                $projectsArray[$projName]['modules'][$modName]['permissions'] = array();
            }
        } else {
            $projectsArray[$projName]['modules'] = array();
        }
    }
}
#endregion

echo json_encode($projectsArray, JSON_PRETTY_PRINT);
