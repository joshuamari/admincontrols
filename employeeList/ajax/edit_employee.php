<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectqms.php';
require_once '../../dbconn/formsdb.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$fname = NULL;
if (!empty($_POST['fname'])) {
    $fname = $_POST['fname'];
}
$lname = NULL;
if (!empty($_POST['lname'])) {
    $lname = $_POST['lname'];
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
    $empnum = $_POST['empnum'];
}
$username = NULL;
if (!empty($_POST['username'])) {
    $username = $_POST['username'];
}
$group = NULL;
$groupID = 0;
if (!empty($_POST['group'])) {
    $groupID = $_POST['group'];
    $group = getGroupAbbr($groupID);
}
$dhired = NULL;
if (!empty($_POST['dhired'])) {
    $dhired = $_POST['dhired'];
}
$position = NULL;
$positionID = 0;
if (!empty($_POST['position'])) {
    $positionID = $_POST['position'];
    $position = getDesigAbbr($positionID);
}
$email = NULL;
if (!empty($_POST['email'])) {
    $email = $_POST['email'];
}
$addHash = password_hash($username, PASSWORD_DEFAULT);
$addPic = "pic_" . $empnum . ".jpg";
$addLotus = $email . "/P/KHI";
$addOutlook = $email . "@global.kawasaki.com";

$err = FALSE;
$connDisable->beginTransaction();
$connDisableQMS->beginTransaction();
$conn_new_disable->beginTransaction();
#endregion

#region main
try {
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
    $err = $e->getMessage();
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
    $conn_new_disable->rollBack();
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
#endregion
echo json_encode($err, JSON_PRETTY_PRINT);
