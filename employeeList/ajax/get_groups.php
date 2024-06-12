<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$group = array();
#endregion

#region main
// $groupsQ = "SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldBU NOT IN ('SHI','INT') ORDER BY fldBU";
// $groupsStmt = $connkdt->query($groupsQ);
// $groupsArr = $groupsStmt->fetchAll();
// foreach ($groupsArr as $groups) {
//     $grp = $groups['fldBU'];
//     array_push($output, $grp);
// }
$groupsQ = "SELECT * FROM `group_list` ORDER BY `name`";
$groupStmt = $connnew->query($groupsQ);
$group = $groupStmt->fetchAll();
#endregion

#region function

#endregion
echo json_encode($group);
