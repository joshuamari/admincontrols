<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$searchWord = NULL;
$searchStmt = '';
$searchExec = [];
if (!empty($_POST['searchWord'])) {
    $searchWord = $_POST['searchWord'];
    $searchStmt = " AND (fldBUName LIKE :searchWord)";
    $searchExec = [":searchWord" => "%$searchWord%"];
}
$groupsArray = [];
#endregion

#region main query
$grpsQ = "SELECT * FROM `kdtbu` WHERE fldBU NOT IN ('SHI','INT') AND fldDepartment<>'' $searchStmt ORDER BY fldBU";
$grpsStmt = $connkdt->prepare($grpsQ);
$grpsStmt->execute($searchExec);
if ($grpsStmt->rowCount() > 0) {
    $grpsArr = $grpsStmt->fetchAll();
    foreach ($grpsArr as $grps) {
        $output = array();
        $grpID = $grps['fldID'];
        $grpCode = $grps['fldBU'];
        $grpName = $grps['fldBUName'];
        $grpDept = $grps['fldDepartment'];
        $output += ["id" => $grpID];
        $output += ["code" => $grpCode];
        $output += ["name" => $grpName];
        $output += ["dept" => $grpDept];
        array_push($groupsArray, $output);
    }
}
#endregion

#region function

#endregion

echo json_encode($groupsArray);
