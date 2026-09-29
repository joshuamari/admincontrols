<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew)) {
    error_log("get_departments missing database connection");
    authJsonFail("Unable to load departments.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 39);

#region initialize variables
$deptsArray = [];
#endregion

#region main query
$deptsQ = "SELECT id, name FROM `department_list` ORDER BY name";
$deptsStmt = $connnew->prepare($deptsQ);
$deptsStmt->execute();
if ($deptsStmt->rowCount() > 0) {
    $deptsArr = $deptsStmt->fetchAll();
    foreach ($deptsArr as $depts) {
        $output = array();
        $output += ["id" => $depts['id']];
        $output += ["name" => $depts['name']];
        array_push($deptsArray, $output);
    }
}
#endregion

echo json_encode($deptsArray);
