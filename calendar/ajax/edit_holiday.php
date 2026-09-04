<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectwebjmr.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connwebjmr)) {
    error_log("edit_holiday missing database connection");
    authJsonFail("Unable to save holiday.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 41);

#region Initialize Variable
$holidayName = NULL;
if (!empty($_POST['holName'])) {
    $holidayName = trim($_POST['holName']);
}
$startDate = NULL;
if (!empty($_POST['holDate'])) {
    $startDate = $_POST['holDate'];
}
$locID = NULL;
if (!empty($_POST['locID'])) {
    $locID = filter_var($_POST['locID'], FILTER_VALIDATE_INT);
}
$holidayType = NULL;
if (isset($_POST['holType']) && $_POST['holType'] !== '') {
    $holidayType = filter_var($_POST['holType'], FILTER_VALIDATE_INT);
}
$holidayID = NULL;
if (isset($_POST['holidayID']) && $_POST['holidayID'] !== '') {
    $holidayID = filter_var($_POST['holidayID'], FILTER_VALIDATE_INT);
}

if ($holidayID === false || $holidayID === NULL || (int)$holidayID <= 0) {
    authJsonFail("Unable to save holiday.");
}
$holidayID = (int)$holidayID;
if (!holidayExists($holidayID)) {
    authJsonFail("Unable to save holiday.");
}
if ($holidayName === NULL || $holidayName === '') {
    authJsonFail("Holiday name is required.");
}
if ($startDate === NULL || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
    authJsonFail("Holiday date is required.");
}
if ($locID === false || $locID === NULL || (int)$locID <= 0) {
    authJsonFail("Location is required.");
}
$locID = (int)$locID;
$locName = getLocationName($locID);
if ($locName === NULL || $locName === '') {
    authJsonFail("Location was not found.");
}
if ($holidayType === false || $holidayType === NULL || (int)$holidayType < 0 || (int)$holidayType > 2) {
    authJsonFail("Holiday type is required.");
}
$holidayType = (int)$holidayType;

if (checkDuplicate($startDate, $locID, $holidayID)) {
    authJsonFail("Duplicate holiday.");
}

$msg = array();
#endregion

#region Entries Query
try {
    $updateQ = "UPDATE `kdtholiday` SET `fldLocation`=:locName, `fldLocID`=:locID,`fldDate`=:startDate,`fldHoliday`=:holidayName,`fldHolidayType`=:holidayType,`fldModified`=:empNumber WHERE `fldID`=:holidayid";
    $updateStmt = $connkdt->prepare($updateQ);
    if ($updateStmt === false || $updateStmt->execute([":locName" => $locName, ":locID" => $locID, ":startDate" => $startDate, ":holidayName" => $holidayName, ":holidayType" => $holidayType, ":empNumber" => $actorEmpNum, ":holidayid" => $holidayID]) === false) {
        error_log("edit_holiday mutation failed");
        authJsonFail("Unable to save holiday.");
    }
    $msg["isSuccess"] = true;
    $msg["message"] = "Editing holiday successfull";
} catch (Exception $e) {
    error_log("edit_holiday mutation failed");
    authJsonFail("Unable to save holiday.");
}

#endregion
echo json_encode($msg);


#region Functions
function holidayExists($holidayid)
{
    global $connkdt;
    $holQ = "SELECT fldID FROM `kdtholiday` WHERE fldID=:holidayid LIMIT 1";
    $holStmt = $connkdt->prepare($holQ);
    $holStmt->execute([":holidayid" => $holidayid]);
    return $holStmt->fetchColumn() !== false;
}
function checkDuplicate($startdate, $locationid, $holidayid)
{
    global $connkdt;
    $isDuplicate = FALSE;
    $dupQ = "SELECT fldID FROM `kdtholiday` WHERE fldLocID=:locationid AND fldDate=:startdate AND fldID<>:holidayid LIMIT 1";
    $dupStmt = $connkdt->prepare($dupQ);
    $dupStmt->execute([":startdate" => $startdate, ":locationid" => $locationid, ":holidayid" => $holidayid]);
    if ($dupStmt->fetchColumn() !== false) {
        $isDuplicate = TRUE;
    }
    return $isDuplicate;
}
function getLocationName($locationid)
{
    global $connwebjmr;
    $name = NULL;
    $nameQ = "SELECT fldLocation FROM `dispatch_locations` WHERE fldID=:locationid LIMIT 1";
    $nameStmt = $connwebjmr->prepare($nameQ);
    $nameStmt->execute([":locationid" => $locationid]);
    $fetched = $nameStmt->fetchColumn();
    if ($fetched !== false) {
        $name = $fetched;
    }
    return $name;
}
#endregion
