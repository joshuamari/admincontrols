<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$searchWord='';
if(!empty($_POST['searchWord'])){
    $searchWord=$_POST['searchWord'];
}
$output=array();
#endregion

#region main
$empQ="SELECT * FROM emp_prof WHERE fldName LIKE '%$searchWord%' AND fldNick<>'' ORDER BY fldActive DESC,fldEmployeeNum";
$empStmt=$connkdt->query($empQ);
$empArr=$empStmt->fetchAll();
foreach($empArr AS $emps){
    $empNum=$emps['fldEmployeeNum'];
    $empName=$emps['fldFirstname']." ".$emps['fldSurname'];
    $empUser=$emps['fldUser'];
    $empGroup=$emps['fldGroup'];
    $empDept=getDepartment($empGroup);
    $empPos=$emps['fldDesig'];
    array_push($output,$empNum."||".$empName."||".$empUser."||".$empDept."||".$empGroup."||".$empPos);
}
#endregion

#region function
function getDepartment($grp){
    GLOBAL $connkdt;
    $deptQ="SELECT fldDepartment FROM kdtbu WHERE fldBU='$grp'";
    $deptStmt=$connkdt->query($deptQ);
    $dept=$deptStmt->fetchColumn();
    return $dept;
}
#endregion
//$.ajaxSetup({async: false});
echo json_encode($output);
?>