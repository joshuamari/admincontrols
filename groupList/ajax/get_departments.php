<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

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

#region function

#endregion

echo json_encode($deptsArray);
