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
    error_log("get_empDetails missing database connection");
    authJsonFail("Unable to load employee.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 16);

#region initialize variables
$employeeArray = array();
$empNum = NULL;
if (!empty($_POST['empNum'])) {
    $empNum = filter_var($_POST['empNum'], FILTER_VALIDATE_INT);
}
#endregion

#region main
if ($empNum !== false && $empNum !== NULL && (int)$empNum > 0) {
    $empNum = (int)$empNum;
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
            $employeeGroup = getGroupID($emp['fldGroup']);
            $employeePos = getPosID($emp['fldDesig']);
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
}

#endregion

#region function
function getGroupID($grpname)
{
    global $connnew;
    $groupID = 0;
    $groupQ = "SELECT `id` FROM `group_list` WHERE `abbreviation`=:grpname";
    $groupStmt = $connnew->prepare($groupQ);
    $groupStmt->execute([":grpname" => $grpname]);
    if ($groupStmt->rowCount() > 0) {
        $groupID = $groupStmt->fetchColumn();
    }
    return $groupID;
}
function getPosID($posacr)
{
    global $connnew;
    $posID = 0;
    $posQ = "SELECT `id` FROM `designation_list` WHERE `acronym`=:posacr";
    $posStmt = $connnew->prepare($posQ);
    $posStmt->execute([":posacr" => $posacr]);
    if ($posStmt->rowCount() > 0) {
        $posID = $posStmt->fetchColumn();
    }
    return $posID;
}
#endregion
echo json_encode($employeeArray);
