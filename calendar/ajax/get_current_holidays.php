<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("get_current_holidays missing database connection");
    authJsonFail("Unable to load holidays.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 41);

#region initialize variables
$holidays = array();
$locID = 1;
if (!empty($_POST['locID'])) {
    $parsedLoc = filter_var($_POST['locID'], FILTER_VALIDATE_INT);
    if ($parsedLoc !== false && (int)$parsedLoc > 0) {
        $locID = (int)$parsedLoc;
    }
}
$currentYear = date("Y");
$currentMonth = date("m");
#endregion

#region main
$holidayQ = "SELECT * FROM `kdtholiday` WHERE fldDate LIKE :selectedYear AND fldLocID =:locID ORDER BY fldDate";
$holidayStmt = $connkdt->prepare($holidayQ);
$holidayStmt->execute([":selectedYear" => "$currentYear-$currentMonth-%", ":locID" => $locID]);
if ($holidayStmt->rowCount() > 0) {
    $holArr = $holidayStmt->fetchAll();
    foreach ($holArr as $hol) {
        $output = array();
        $output["holID"] = $hol['fldID'];
        $output["holName"] = $hol['fldHoliday'];
        $output["holYear"] = date("Y");
        $output["holMonth"] = date("n", strtotime($hol['fldDate']));
        $output["holDay"] = date("j", strtotime($hol['fldDate']));
        $output["holLocation"] = $hol['fldLocation'];
        $output["holType"] = $hol['fldHolidayType'];
        array_push($holidays, $output);
    }
}
#endregion

echo json_encode($holidays);
