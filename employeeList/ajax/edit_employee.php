<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectqms.php';
require_once '../../dbconn/formsdb.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (
    !isset($connkdt, $connqms, $connnew, $connDisable, $connDisableQMS, $conn_new_disable)
) {
    error_log("edit_employee missing database connection");
    authJsonFail("Unable to save employee.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 17);

#region initialize variables
$fname = NULL;
if (!empty($_POST['fname'])) {
    $fname = ucwords(strtolower(trim($_POST['fname'])));
}
$lname = NULL;
if (!empty($_POST['lname'])) {
    $lname = ucwords(strtolower(trim($_POST['lname'])));
}
$fullName = strtoupper(($lname)) . "_" . $fname;
$nname = NULL;
if (!empty($_POST['nname'])) {
    $nname = $_POST['nname'];
}
$bday = NULL;
if (!empty($_POST['bday'])) {
    $bday = $_POST['bday'];
}
$gender = NULL;
$genderID = 0;
if (!empty($_POST['gender'])) {
    $gender = $_POST['gender'];
    $genderID = $gender == "M" ? 0 : 1;
}
$status = NULL;
$statusID = 0;
if (!empty($_POST['status'])) {
    $status = $_POST['status'];
    $statusID = $status == "Single" ? 0 : 1;
}
$empnum = NULL;
if (!empty($_POST['empnum'])) {
    $empnum = filter_var($_POST['empnum'], FILTER_VALIDATE_INT);
}
$username = NULL;
if (!empty($_POST['username'])) {
    $username = $_POST['username'];
}
$group = NULL;
$groupID = 0;
if (!empty($_POST['group'])) {
    $groupID = filter_var($_POST['group'], FILTER_VALIDATE_INT);
    if ($groupID !== false) {
        $group = getGroupAbbr($groupID);
    }
}
$dhired = NULL;
if (!empty($_POST['dhired'])) {
    $dhired = $_POST['dhired'];
}
$position = NULL;
$positionID = 0;
if (!empty($_POST['position'])) {
    $positionID = filter_var($_POST['position'], FILTER_VALIDATE_INT);
    if ($positionID !== false) {
        $position = getDesigAbbr($positionID);
    }
}
$email = NULL;
if (!empty($_POST['email'])) {
    $email = $_POST['email'];
}

if (
    $empnum === false || $empnum === NULL || (int)$empnum <= 0 ||
    empty($fname) || empty($lname) || empty($nname) || empty($bday) ||
    empty($gender) || empty($status) || empty($username) ||
    $groupID === false || (int)$groupID <= 0 || $group === NULL ||
    empty($dhired) ||
    $positionID === false || (int)$positionID <= 0 || $position === NULL ||
    empty($email)
) {
    authJsonFail("Unable to save employee.");
}
$empnum = (int)$empnum;
$groupID = (int)$groupID;
$positionID = (int)$positionID;

if (!targetEmployeeExists($empnum)) {
    authJsonFail("Unable to save employee.");
}

$addHash = password_hash($username, PASSWORD_DEFAULT);
$addPic = "pic_" . $empnum . ".jpg";
$addLotus = $email . "/P/KHI";
$addOutlook = $email . "@global.kawasaki.com";
#endregion

#region main
try {
    $connDisable->beginTransaction();
    $connDisableQMS->beginTransaction();
    $conn_new_disable->beginTransaction();
    $editQMSQuery = "UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editQMSStmt = $connDisableQMS->prepare($editQMSQuery);
    $editQMSStmt->execute([":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":group" => $group, ":position" => $position, ":bday" => $bday, ":gender" => $gender, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $editKDTQuery = "UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTStmt = $connDisable->prepare($editKDTQuery);
    $editKDTStmt->execute([":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":group" => $group, ":position" => $position, ":bday" => $bday, ":gender" => $gender, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $editKDTLoginQuery = "UPDATE kdtlogin SET fldOutlook=:addOutlook,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTLoginStmt = $connDisable->prepare($editKDTLoginQuery);
    $editKDTLoginStmt->execute([":addOutlook" => $addOutlook, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $editNewQuery = "UPDATE `employee_list` SET `surname`=:lname, `firstname`=:fname,`nickname`=:nname,`username`=:username,`email`=:email,`group_id`=:groupid,`designation`=:posid,`birthdate`=:bday,`gender`=:genderid,`marital_status`=:statusid,`date_hired`=:dhired WHERE `id`=:empnum";
    $editNewStmt = $conn_new_disable->prepare($editNewQuery);
    $editNewStmt->execute([":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":email" => $addOutlook, ":groupid" => $groupID, ":posid" => $positionID, ":bday" => $bday, ":genderid" => $genderID, ":statusid" => $statusID, ":dhired" => $dhired, ":empnum" => $empnum]);

    $connDisable->commit();
    $connDisableQMS->commit();
    $conn_new_disable->commit();
} catch (Exception $e) {
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
    $conn_new_disable->rollBack();
    error_log("edit_employee mutation failed");
    authJsonFail("Unable to save employee.");
}
#endregion

#region function
function getGroupAbbr($grpid)
{
    global $connnew;
    $abbr = NULL;
    $groupQ = "SELECT `abbreviation` FROM `group_list` WHERE `id`=:grpid";
    $groupStmt = $connnew->prepare($groupQ);
    $groupStmt->execute([":grpid" => $grpid]);
    if ($groupStmt->rowCount() > 0) {
        $abbr = $groupStmt->fetchColumn();
    }
    return $abbr;
}
function getDesigAbbr($desigid)
{
    global $connnew;
    $abbr = NULL;
    $groupQ = "SELECT `acronym` FROM `designation_list` WHERE `id`=:desigid";
    $groupStmt = $connnew->prepare($groupQ);
    $groupStmt->execute([":desigid" => $desigid]);
    if ($groupStmt->rowCount() > 0) {
        $abbr = $groupStmt->fetchColumn();
    }
    return $abbr;
}
function targetEmployeeExists($empnum)
{
    global $connkdt;
    $empQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldEmployeeNum = :empnum LIMIT 1";
    $empStmt = $connkdt->prepare($empQ);
    $empStmt->execute([":empnum" => $empnum]);
    return $empStmt->fetchColumn() !== false;
}
#endregion
echo json_encode(false);
