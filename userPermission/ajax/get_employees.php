<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$searchWord = NULL;
$searchStmt = '';
if (!empty($_POST['searchWord'])) {
    $searchWord = $_POST['searchWord'];
    $searchStmt = " AND (fldSurname LIKE '%$searchWord%' OR fldFirstname LIKE '%$searchWord%' OR CONCAT(fldFirstname,' ',fldSurname) LIKE '%$searchWord%')";
}
$permissionsArray = array();
#endregion

#region Entries Query
$permissionQ = "SELECT ep.fldEmployeeNum,CONCAT(ep.fldFirstname,' ',ep.fldSurname) AS ename, GROUP_CONCAT(DISTINCT kp.project_name ORDER BY kp.project_id) AS projs FROM (SELECT * FROM emp_prof WHERE fldActive = 1 AND fldNick<>'' $searchStmt) AS ep LEFT JOIN `user_permissions` AS up ON ep.fldEmployeeNum = up.fldEmployeeNum LEFT JOIN p_permissions AS p ON up.permission_id = p.permission_id LEFT JOIN kdtproject_modules AS km ON p.module_id = km.module_id LEFT JOIN kdtwebprojects AS kp ON km.project_id = kp.project_id GROUP BY ep.fldEmployeeNum ORDER BY ep.fldEmployeeNum";
$permissionStmt = $connkdt->query($permissionQ);
if ($permissionStmt->rowCount() > 0) {
    $permArr = $permissionStmt->fetchAll();
    foreach ($permArr as $perm) {
        $output = array();
        $projKey = array();
        $empID = $perm['fldEmployeeNum'];
        $empName = $perm['ename'];
        $projs = $perm['projs'] == NULL ? [] : explode(",", $perm['projs'] ?? '');
        foreach ($projs as $proj) {
            $projClass = getClass($proj);
            $projKey[$proj] = $projClass;
        }
        $output['emp_id'] = $empID;
        $output['emp_name'] = $empName;
        $output['projs'] = $projKey;
        array_push($permissionsArray, $output);
    }
}
#endregion
function getClass($projName)
{
    global $connkdt;
    $myClass = NULL;
    $classQ = "SELECT project_css_class FROM kdtwebprojects WHERE project_name = :projName";
    $classStmt = $connkdt->prepare($classQ);
    $classStmt->execute([":projName" => $projName]);
    if ($classStmt->rowCount() > 0) {
        $myClass = $classStmt->fetchColumn();
    }
    return $myClass;
}

echo json_encode($permissionsArray, JSON_PRETTY_PRINT);
