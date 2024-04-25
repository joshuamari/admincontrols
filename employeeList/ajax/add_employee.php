<?php
#region Require Database Connections
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
    $insertQMSquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
        VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertQMSstmt = $connqms->prepare($insertQMSquery);
    $insertQMSstmt->execute([":empnum" => $empnum, ":username" => $username, ":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":group" => $group, ":position" => $position, ":bday" => $bday, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":addPic" => $addPic, ":gender" => $gender]);

    $insertKDTquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
        VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertKDTstmt = $connkdt->prepare($insertKDTquery);
    $insertKDTstmt->execute([":empnum" => $empnum, ":username" => $username, ":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":group" => $group, ":position" => $position, ":bday" => $bday, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":addPic" => $addPic, ":gender" => $gender]);

    $insertEntryLogs = "INSERT INTO entry_logs(fldEmployeeNum)  
        VALUES (:empnum)";
    $insertEntryLogsstmt = $connqms->prepare($insertEntryLogs);
    $insertEntryLogsstmt->execute([":empnum" => $empnum]);

    $insertKDTLoginquery = "INSERT INTO kdtlogin(fldUser,fldUserHash,fldPw,fldOutlook,fldLotus,fldEmployeeNum)  
        VALUES (:username,:addHash,'kdtpass',:addOutlook,:addLotus,:empnum)";
    $insertKDTLoginStmt = $connkdt->prepare($insertKDTLoginquery);
    $insertKDTLoginStmt->execute([":username" => $username, ":addHash" => $addHash, ":addOutlook" => $addOutlook, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $insertKDTOptionquery = "INSERT INTO kdtoptions(fldEmployeeNumber,fldUser)  
        VALUES (:empnum,:username)";
    $insertKDTOptionStmt = $connkdt->prepare($insertKDTOptionquery);
    $insertKDTOptionStmt->execute([":empnum" => $empnum, ":username" => $username]);

    $insertLeaveFormCountQ = "INSERT INTO leave_confirmation(lc_eid) VALUES(:empnum)";
    $insertLeaveFormCountStmt = $connforms->prepare($insertLeaveFormCountQ);
    $insertLeaveFormCountStmt->execute([":empnum" => $empnum]);

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
