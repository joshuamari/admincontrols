<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$holidays = array();
$currentYear = date("Y");
#endregion

#region main
$holidayQ = "SELECT * FROM `kdtholiday` WHERE fldDate LIKE :currentYear AND fldLocation ='KDT' ORDER BY fldDate";
$holidayStmt = $connkdt->prepare($holidayQ);
$holidayStmt->execute([":currentYear" => "$currentYear-%"]);
if ($holidayStmt->rowCount() > 0) {
    $holArr = $holidayStmt->fetchAll();
    foreach ($holArr as $hol) {
        $output = array();
        $output["holID"] = $hol['fldID'];
        $output["holName"] = $hol['fldHoliday'];
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
//$.ajaxSetup({async: false});
echo json_encode($holidays);
