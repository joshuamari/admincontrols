<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
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
    $section = getSectionName($sectionID);
    $prio = getMax($sectionID);
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "SectionID Missing";
}
if (checkDuplicate($posName, $posAcr)) {
    $msg["isSuccess"] = false;
    $msg['message'] = "Desig Duplicate";
}

$insertQ = "INSERT INTO `kdtpositions`(`fldAcro`,`fldFull`,`fldSection`,`fldSectionID`,`fldPrio`) VALUES (:posAcr,:posName,:section,:sectionID,:prio)";
$insertStmt = $connkdt->prepare($insertQ);
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $insertStmt->execute([":posAcr" => $posAcr, ":posName" => $posName, ":section" => $section, ":sectionID" => $sectionID, ":prio" => $prio]);
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
    global $connkdt;
    $isDuplicate = FALSE;
    $dupQ = "SELECT * FROM `kdtpositions` WHERE fldFull=:posName OR fldAcro=:posAcr";
    $dupStmt = $connkdt->prepare($dupQ);
    $dupStmt->execute([":posName" => $posName, ":posAcr" => $posAcr]);
    if ($dupStmt->rowCount() > 0) {
        $isDuplicate = TRUE;
    }
    return $isDuplicate;
}
function getSectionName($secid)
{
    global $connkdt;
    $name = NULL;
    $nameQ = "SELECT fldSection FROM `kdtpositions_sections` WHERE fldSectionID=:secid";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":secid" => $secid]);
    if ($nameStmt->rowCount() > 0) {
        $name = $nameStmt->fetchColumn();
    }
    return $name;
}
function getMax($secid)
{
    global $connkdt;
    $max = 0;
    $maxQ = "SELECT MAX(fldPrio) FROM `kdtpositions` WHERE fldSectionID=:secid";
    $maxStmt = $connkdt->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    if ($maxStmt->rowCount() > 0) {
        $max = (int)$maxStmt->fetchColumn();
    }
    return $max + 1;
}
#endregion
