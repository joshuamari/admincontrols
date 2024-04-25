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
    $msg['message'] = "Type Missing";
}
$holidayID = 0;
if (isset($_POST['holidayID'])) {
    $holidayID = $_POST['holidayID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "ID Missing";
}
if (checkDuplicate($startDate, $locID, $holidayID)) {
    $msg["isSuccess"] = false;
    $msg['message'] = "Holiday Duplicate";
}

$updateQ = "UPDATE `kdtholiday` SET `fldLocation`=:locName, `fldLocID`=:locID,`fldDate`=:startDate,`fldHoliday`=:holidayName,`fldHolidayType`=:holidayType,`fldModified`=:empNumber WHERE `fldID`=:holidayid";
$updateStmt = $connkdt->prepare($updateQ);
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $updateStmt->execute([":locName" => $locName, ":locID" => $locID, ":startDate" => $startDate, ":holidayName" => $holidayName, ":holidayType" => $holidayType, ":empNumber" => $empNumber, ":holidayid" => $holidayID]);
        $msg["isSuccess"] = true;
        $msg["message"] = "Editing holiday successfull";
    }
} catch (Exception $e) {
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);


#region Functions
function checkDuplicate($startdate, $locationid, $holidayid)
{
    global $connkdt;
    $isDuplicate = FALSE;
    $dupQ = "SELECT * FROM `kdtholiday` WHERE fldLocID=:locationid AND fldDate=:startdate AND fldID<>:holidayid";
    $dupStmt = $connkdt->prepare($dupQ);
    $dupStmt->execute([":startdate" => $startdate, ":locationid" => $locationid, ":holidayid" => $holidayid]);
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
