<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectqms.php';
require_once '../Includes/formsdb.php';
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
if (!empty($_POST['gender'])) {
    $gender = $_POST['gender'];
}
$status = NULL;
if (!empty($_POST['status'])) {
    $status = $_POST['status'];
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
if (!empty($_POST['group'])) {
    $group = $_POST['group'];
}
$dhired = NULL;
if (!empty($_POST['dhired'])) {
    $dhired = $_POST['dhired'];
}
$position = NULL;
if (!empty($_POST['position'])) {
    $position = $_POST['position'];
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
$connDisableForms->beginTransaction();
#endregion

#region main
try {
    $editQMSQuery = "UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editQMSStmt = $connqms->prepare($editQMSQuery);
    $editQMSStmt->execute([":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":group" => $group, ":position" => $position, ":bday" => $bday, ":gender" => $gender, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $editKDTQuery = "UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTStmt = $connkdt->prepare($editKDTQuery);
    $editKDTStmt->execute([":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":group" => $group, ":position" => $position, ":bday" => $bday, ":gender" => $gender, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $editKDTLoginQuery = "UPDATE kdtlogin SET fldOutlook=:addOutlook,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTLoginStmt = $connkdt->prepare($editKDTLoginQuery);
    $editKDTLoginStmt->execute([":addOutlook" => $addOutlook, ":addLotus" => $addLotus, ":empnum" => $empnum]);
    $connDisable->commit();
    $connDisableQMS->commit();
    $connDisableForms->commit();
} catch (Exception $e) {
    $err = $e;
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
    $connDisableForms->rollBack();
}
#endregion

#region function

#endregion
echo json_encode($err, JSON_PRETTY_PRINT);
