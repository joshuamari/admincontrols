<?php
#region DB Connect
// require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$msg = array();
$posName = NULL;
if (!empty($_POST['name'])) {
    $posName = $_POST['name'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Position Name Missing";
}
$posAcr = NULL;
if (!empty($_POST['acro'])) {
    $posAcr = $_POST['acro'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Position Acro Missing";
}
$section = NULL;
$sectionID = 0;
$prio = 0;
if (!empty($_POST['sectionID'])) {
    $sectionID = $_POST['sectionID'];
    // $section = getSectionName($sectionID);
    $prio = getMax($sectionID);
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "SectionID Missing";
}
if (checkDuplicate($posName, $posAcr)) {
    $msg["isSuccess"] = false;
    $msg['message'] = "Desig Duplicate";
}

$insertQ = "INSERT INTO `designation_list`(`acronym`,`name`,`section`,`priority`) VALUES (:posAcr,:posName,:sectionID,:prio)";
$insertStmt = $connnew->prepare($insertQ);
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $insertStmt->execute([":posAcr" => $posAcr, ":posName" => $posName, ":sectionID" => $sectionID, ":prio" => $prio]);
        $msg["isSuccess"] = true;
        $msg["message"] = "Adding designation successfull";
    }
} catch (Exception $e) {
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);


#region Functions
function checkDuplicate($posName, $posAcr)
{
    global $connnew;
    $isDuplicate = FALSE;
    $dupQ = "SELECT * FROM `designation_list` WHERE `name`=:posName OR `acronym`=:posAcr";
    $dupStmt = $connnew->prepare($dupQ);
    $dupStmt->execute([":posName" => $posName, ":posAcr" => $posAcr]);
    if ($dupStmt->rowCount() > 0) {
        $isDuplicate = TRUE;
    }
    return $isDuplicate;
}
function getSectionName($secid)
{
    global $connnew;
    $name = NULL;
    $nameQ = "SELECT fldSection FROM `kdtpositions_sections` WHERE fldSectionID=:secid";
    $nameStmt = $connnew->prepare($nameQ);
    $nameStmt->execute([":secid" => $secid]);
    if ($nameStmt->rowCount() > 0) {
        $name = $nameStmt->fetchColumn();
    }
    return $name;
}
function getMax($secid)
{
    global $connnew;
    $max = 0;
    $maxQ = "SELECT MAX(`priority`) FROM `designation_list` WHERE `section`=:secid";
    $maxStmt = $connnew->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    if ($maxStmt->rowCount() > 0) {
        $max = (int)$maxStmt->fetchColumn();
    }
    return $max + 1;
}
#endregion
