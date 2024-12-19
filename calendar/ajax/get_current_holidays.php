<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$holidays = array();
$locID = 1;
if (!empty($_POST['locID'])) {
    $locID = $_POST['locID'];
}
$selectedYear = date("Y");
if (!empty($_POST['selectedYear'])) {
    $selectedYear = $_POST['selectedYear'];
}
$selectedMonth = date("m");
if (!empty($_POST['selectedMonth'])) {
    $selectedMonth = $_POST['selectedMonth'];
}
#endregion

#region main
$holidayQ = "SELECT * FROM `kdtholiday` WHERE fldDate LIKE :selectedYear AND fldLocID =:locID ORDER BY fldDate";
$holidayStmt = $connkdt->prepare($holidayQ);
$holidayStmt->execute([":selectedYear" => "$selectedYear-$selectedMonth-%", ":locID" => $locID]);
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

#region function

#endregion
echo json_encode($holidays);
