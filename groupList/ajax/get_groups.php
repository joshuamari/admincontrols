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
    error_log("get_groups missing database connection");
    authJsonFail("Unable to load groups.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 39);

#region initialize variables
$groupsArray = [];
#endregion

#region main query
$grpsQ = "SELECT gl.*, dl.`name` AS dept FROM `group_list` AS gl JOIN `department_list` AS dl ON gl.dept_id=dl.id ORDER BY gl.abbreviation";
$grpsStmt = $connnew->prepare($grpsQ);
$grpsStmt->execute();
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

echo json_encode($groupsArray);
