<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$searchWord = '';
if (!empty($_POST['searchWord'])) {
    $searchWord = $_POST['searchWord'];
}
$active = 0;
if (!empty($_POST['active'])) {
    $active = $_POST['active'];
}
$activeStatement = "";
if ($active == 1) {
    $activeStatement = " AND ep.fldActive=1";
}
$employeeArray = array();
#endregion

#region main
$empQ = "SELECT ep.fldEmployeeNum,CONCAT(ep.fldFirstname,' ',ep.fldSurname) AS ename,ep.fldUser,ep.fldGroup,bu.fldDepartment,ep.fldDesig FROM emp_prof AS ep JOIN kdtbu AS bu ON ep.fldGroup=bu.fldBU WHERE ep.fldNick<>'' AND (ep.fldSurname LIKE :esearch OR ep.fldFirstname LIKE :esearch OR CONCAT(ep.fldFirstname,' ',ep.fldSurname) LIKE :esearch) $activeStatement ORDER BY ep.fldActive DESC,ep.fldEmployeeNum";
$empStmt = $connkdt->prepare($empQ);
$empStmt->execute([":esearch" => "%$searchWord%"]);
if ($empStmt->rowCount() > 0) {
    $empArr = $empStmt->fetchAll();
    foreach ($empArr as $emps) {
        $output = array();
        $empNum = $emps['fldEmployeeNum'];
        $empName = $emps['ename'];
        $empUser = $emps['fldUser'];
        $empGroup = $emps['fldGroup'];
        $empDept = $emps['fldDepartment'];
        $empPos = $emps['fldDesig'];
        $output['emp_num'] = $empNum;
        $output['emp_name'] = $empName;
        $output['emp_user'] = $empUser;
        $output['emp_group'] = $empGroup;
        $output['emp_dept'] = $empDept;
        $output['emp_pos'] = $empPos;
        array_push($employeeArray, $output);
    }
}
#endregion

#region function

#endregion
echo json_encode($employeeArray);
