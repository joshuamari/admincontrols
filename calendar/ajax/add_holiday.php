<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$msg = array();
$empNumber = NULL;
if (!empty($_POST['empID'])) {
    $empNumber = $_POST['empID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Employee Number Missing";
}
$holidayName = NULL;
if (!empty($_POST['holName'])) {
    $holidayName = $_POST['holName'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Holiday Name Missing";
}
$startDate = date("Y-m-d");
if (!empty($_POST['holDate'])) {
    $startDate = $_POST['holDate'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Date Missing";
}
$locID = 0;
$locName = NULL;
if (!empty($_POST['locID'])) {
    $locID = $_POST['locID'];
    $locName = getLocationName($locID);
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Location Missing";
}
$holidayType = 0;
if (isset($_POST['holType'])) {
    $holidayType = $_POST['holType'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = $_POST['holType'];
}
if (checkDuplicate($startDate, $locID)) {
    $msg["isSuccess"] = false;
    $msg['message'] = "Holiday Duplicate";
}

$insertQ = "INSERT INTO `kdtholiday`(`fldLocation`,`fldLocID`,`fldDate`,`fldHoliday`,`fldHolidayType`,`fldModified`) VALUES (:locName,:locID,:startDate,:holidayName,:holidayType,:empNumber)";
$insertStmt = $connkdt->prepare($insertQ);
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $insertStmt->execute([":locName" => $locName, ":locID" => $locID, ":startDate" => $startDate, ":holidayName" => $holidayName, ":holidayType" => $holidayType, ":empNumber" => $empNumber]);
        $msg["isSuccess"] = true;
        $msg["message"] = "Adding holiday successfull";
    }
} catch (Exception $e) {
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);


#region Functions
function checkDuplicate($startdate, $locationid)
{
    global $connkdt;
    $isDuplicate = FALSE;
    $dupQ = "SELECT * FROM `kdtholiday` WHERE fldLocID=:locationid AND fldDate=:startdate";
    $dupStmt = $connkdt->prepare($dupQ);
    $dupStmt->execute([":startdate" => $startdate, ":locationid" => $locationid]);
    if ($dupStmt->rowCount() > 0) {
        $isDuplicate = TRUE;
    }
    return $isDuplicate;
}
function getLocationName($locationid)
{
    global $connwebjmr;
    $name = NULL;
    $nameQ = "SELECT fldLocation FROM `dispatch_locations` WHERE fldID=:locationid";
    $nameStmt = $connwebjmr->prepare($nameQ);
    $nameStmt->execute([":locationid" => $locationid]);
    if ($nameStmt->rowCount() > 0) {
        $name = $nameStmt->fetchColumn();
    }
    return $name;
}
#endregion
