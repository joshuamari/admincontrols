<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectqms.php';
require_once '../../dbconn/formsdb.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (
    !isset($connkdt, $connqms, $connnew, $connforms, $connDisable, $connDisableQMS, $connDisableForms, $conn_new_disable)
) {
    error_log("add_employee missing database connection");
    authJsonFail("Unable to save employee.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
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

$addHash = password_hash($username, PASSWORD_DEFAULT);
$addPic = "pic_" . $empnum . ".jpg";
$addLotus = $email . "/P/KHI";
$addOutlook = $email . "@global.kawasaki.com";
#endregion

#region main
try {
    $connDisable->beginTransaction();
    $connDisableQMS->beginTransaction();
    $connDisableForms->beginTransaction();
    $conn_new_disable->beginTransaction();
    $insertQMSquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
        VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertQMSstmt = $connDisableQMS->prepare($insertQMSquery);
    $insertQMSstmt->execute([":empnum" => $empnum, ":username" => $username, ":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":group" => $group, ":position" => $position, ":bday" => $bday, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":addPic" => $addPic, ":gender" => $gender]);

    $insertKDTquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
        VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertKDTstmt = $connDisable->prepare($insertKDTquery);
    $insertKDTstmt->execute([":empnum" => $empnum, ":username" => $username, ":fullName" => $fullName, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":group" => $group, ":position" => $position, ":bday" => $bday, ":cstatus" => $status, ":dhired" => $dhired, ":addLotus" => $addLotus, ":addPic" => $addPic, ":gender" => $gender]);

    $insertEntryLogs = "INSERT INTO entry_logs(fldEmployeeNum)  
        VALUES (:empnum)";
    $insertEntryLogsstmt = $connDisableQMS->prepare($insertEntryLogs);
    $insertEntryLogsstmt->execute([":empnum" => $empnum]);

    $insertKDTLoginquery = "INSERT INTO kdtlogin(fldUser,fldUserHash,fldPw,fldOutlook,fldLotus,fldEmployeeNum)  
        VALUES (:username,:addHash,'kdtpass',:addOutlook,:addLotus,:empnum)";
    $insertKDTLoginStmt = $connDisable->prepare($insertKDTLoginquery);
    $insertKDTLoginStmt->execute([":username" => $username, ":addHash" => $addHash, ":addOutlook" => $addOutlook, ":addLotus" => $addLotus, ":empnum" => $empnum]);

    $insertKDTOptionquery = "INSERT INTO kdtoptions(fldEmployeeNumber,fldUser)  
        VALUES (:empnum,:username)";
    $insertKDTOptionStmt = $connDisable->prepare($insertKDTOptionquery);
    $insertKDTOptionStmt->execute([":empnum" => $empnum, ":username" => $username]);

    $insertLeaveFormCountQ = "INSERT INTO leave_confirmation(lc_eid) VALUES(:empnum)";
    $insertLeaveFormCountStmt = $connDisableForms->prepare($insertLeaveFormCountQ);
    $insertLeaveFormCountStmt->execute([":empnum" => $empnum]);

    $insertNewQ = "INSERT INTO `employee_list`(id,surname,firstname,nickname,username,email,group_id,designation,birthdate,gender,marital_status,date_hired) VALUES(:empnum,:lname,:fname,:nname,:username,:email,:groupID,:positionid,:bday,:genderid,:statusid,:dhired)";

    $insertNewStmt = $conn_new_disable->prepare($insertNewQ);
    $insertNewStmt->execute([":empnum" => $empnum, ":lname" => $lname, ":fname" => $fname, ":nname" => $nname, ":username" => $username, ":email" => $addOutlook, ":groupID" => $groupID, ":positionid" => $positionID, ":bday" => $bday, ":genderid" => $genderID, ":statusid" => $statusID, ":dhired" => $dhired]);
    $connDisable->commit();
    $connDisableQMS->commit();
    $connDisableForms->commit();
    $conn_new_disable->commit();
} catch (Exception $e) {
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
    $connDisableForms->rollBack();
    $conn_new_disable->rollBack();
    error_log("add_employee mutation failed");
    authJsonFail("Unable to save employee.");
}
audit_log($actorEmpNum, "CREATE", "employee", $empnum, null, [
    "firstname" => $fname,
    "surname" => $lname,
    "nickname" => $nname,
    "username" => $username,
    "group" => $group,
    "position" => $position,
    "birthdate" => $bday,
    "gender" => $gender,
    "marital_status" => $status,
    "date_hired" => $dhired,
    "email" => $addOutlook,
    "status" => "Active",
    "resignation_date" => null,
]);
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
echo json_encode(false);
