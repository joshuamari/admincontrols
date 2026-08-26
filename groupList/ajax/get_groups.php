<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
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
// $grpsQ = "SELECT * FROM `kdtbu` WHERE fldBU NOT IN ('SHI','INT') AND fldDepartment<>'' $searchStmt ORDER BY fldBU";
// $grpsStmt = $connkdt->prepare($grpsQ);
$grpsQ = "SELECT gl.*, dl.`name` AS dept FROM `group_list` AS gl JOIN `department_list` AS dl ON gl.dept_id=dl.id ORDER BY gl.abbreviation";
$grpsStmt = $connnew->prepare($grpsQ);
$grpsStmt->execute($searchExec);
if ($grpsStmt->rowCount() > 0) {
    $grpsArr = $grpsStmt->fetchAll();
    foreach ($grpsArr as $grps) {
        $output = array();
        $grpID = $grps['id'];
        $grpCode = $grps['abbreviation'];
        $grpName = $grps['name'];
        $grpDept = $grps['dept'];
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
