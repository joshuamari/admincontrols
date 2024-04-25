<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$employeeArray = array();
$empNum = '';
if (!empty($_POST['empNum'])) {
    $empNum = $_POST['empNum'];
}
#endregion

#region main
$empQ = "SELECT ep.*,kl.fldOutlook AS outmail FROM emp_prof AS ep JOIN kdtlogin AS kl ON ep.fldEmployeeNum=kl.fldEmployeeNum WHERE ep.fldEmployeeNum=:empNum";
$empStmt = $connkdt->prepare($empQ);
$empStmt->execute([":empNum" => $empNum]);
if ($empStmt->rowCount() > 0) {
    $empArr = $empStmt->fetchAll();
    foreach ($empArr as $emp) {
        $employeeNum = $emp['fldEmployeeNum'];
        $firstName = $emp['fldFirstname'];
        $surName = $emp['fldSurname'];
        $nickName = $emp['fldNick'];
        $employeeUser = $emp['fldUser'];
        $employeeGroup = $emp['fldGroup'];
        $employeePos = $emp['fldDesig'];
        $employeeBday = $emp['fldBirthDate'];
        $employeeGender = $emp['fldGender'];
        $employeeStatus = $emp['fldStatus'];
        $employeeDatehired = $emp['fldDateHired'];
        $employeeEmail = $emp['outmail'];
        $employeeResDate = $emp['fldResignDate'];
        $employeeArray['emp_num'] = $employeeNum;
        $employeeArray['emp_fname'] = $firstName;
        $employeeArray['emp_sname'] = $surName;
        $employeeArray['emp_nick'] = $nickName;
        $employeeArray['emp_user'] = $employeeUser;
        $employeeArray['emp_group'] = $employeeGroup;
        $employeeArray['emp_pos'] = $employeePos;
        $employeeArray['emp_bday'] = $employeeBday;
        $employeeArray['emp_gender'] = $employeeGender;
        $employeeArray['emp_status'] = $employeeStatus;
        $employeeArray['emp_dhired'] = $employeeDatehired;
        $employeeArray['emp_outlook'] = explode("@", $employeeEmail)[0];
        $employeeArray['emp_resdate'] = $employeeResDate;
    }
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($employeeArray);
