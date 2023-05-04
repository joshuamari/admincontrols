<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output=array();
$empNum='';
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
#endregion

#region main
$empQ="SELECT * FROM emp_prof WHERE fldEmployeeNum='$empNum'";
$empStmt=$connkdt->query($empQ);
$empArr=$empStmt->fetchAll();
foreach($empArr AS $emp){
    $employeeNum=$emp['fldEmployeeNum'];
    $firstName=$emp['fldFirstname'];
    $surName=$emp['fldSurname'];
    $nickName=$emp['fldNick'];
    $employeeUser=$emp['fldUser'];
    $employeeGroup=$emp['fldGroup'];
    $employeePos=$emp['fldDesig'];
    $employeeBday=$emp['fldBirthDate'];
    $employeeGender=$emp['fldGender'];
    $employeeStatus=$emp['fldStatus'];
    $employeeDatehired=$emp['fldDateHired'];
    $employeeEmail=getEmail($employeeNum);
    $employeeResDate=$emp['fldResignDate'];
    array_push($output,$employeeNum."||".$firstName."||".$surName."||".$nickName."||".$employeeUser."||".$employeeGroup."||".$employeePos."||".$employeeBday."||".$employeeGender."||".$employeeStatus."||".$employeeDatehired."||".$employeeEmail."||".$employeeResDate);
}
#endregion

#region function
function getEmail($iVal){
    GLOBAL $connkdt;
    $empEmail='';
    $empEmailQ="SELECT fldLotus FROM kdtlogin WHERE fldEmployeeNum='$iVal'";
    $empEmailStmt=$connkdt->query($empEmailQ);
    if($empEmailStmt->rowCount()>0){
        $empEmail=$empEmailStmt->fetchColumn();
    }
    return $empEmail;
}
#endregion
//$.ajaxSetup({async: false});
echo json_encode($output)
?>