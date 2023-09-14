<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output=array();
#endregion

#region main
$groupsQ="SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldBU NOT IN ('SHI','INT','DXT') ORDER BY fldBU";
$groupsStmt=$connkdt->query($groupsQ);
$groupsArr=$groupsStmt->fetchAll();
foreach($groupsArr AS $groups){
    $grp=$groups['fldBU'];
    array_push($output,$grp);
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($output)
?>