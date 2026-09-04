<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("get_departments missing database connection");
    authJsonFail("Unable to load departments.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 39);

#region initialize variables
$deptsArray = [];
#endregion

#region main query
$deptsQ = "SELECT * FROM `departments` ORDER BY fldDepartment";
$deptsStmt = $connkdt->prepare($deptsQ);
$deptsStmt->execute();
if ($deptsStmt->rowCount() > 0) {
    $deptsArr = $deptsStmt->fetchAll();
    foreach ($deptsArr as $depts) {
        $output = array();
        $deptID = $depts['fldID'];
        $deptName = $depts['fldDepartment'];
        $output += ["id" => $deptID];
        $output += ["name" => $deptName];
        array_push($deptsArray, $output);
    }
}
#endregion

echo json_encode($deptsArray);
