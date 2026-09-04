<?php
require_once '../dbconn/dbconnectkdtph.php'; //database connection
$output = array();
$userHash = '';
if (isset($_COOKIE['userID'])) {
    $userHash = $_COOKIE['userID'];
}
if (!empty($userHash)) {
    $loginQ = "SELECT fldEmployeeNum FROM kdtlogin WHERE fldUserHash = :hash LIMIT 1";
    $loginStmt = $connkdt->prepare($loginQ);
    $loginStmt->execute([":hash" => $userHash]);
    if ($loginStmt->rowCount() > 0) {
        $userLogin = $loginStmt->fetchColumn();
        $output += ["empNum" => $userLogin];
        $empDeetsQ = "SELECT fldGroup, fldFirstname, fldSurname, fldNick, fldDateHired, fldDesig FROM emp_prof WHERE fldEmployeeNum = :empNum";
        $empDeetsStmt = $connkdt->prepare($empDeetsQ);
        $empDeetsStmt->execute([":empNum" => $userLogin]);
        $empDeetsArr = $empDeetsStmt->fetchAll();
        foreach ($empDeetsArr as $empdeets) {
            $output += ["empGroup" => $empdeets['fldGroup']];
            $output += ["empFName" => $empdeets['fldFirstname']];
            $output += ["empSName" => $empdeets['fldSurname']];
            $output += ["empNName" => $empdeets['fldNick']];
            $output += ["empDateHired" => $empdeets['fldDateHired']];
            $output += ["empPos" => $empdeets['fldDesig']];
        }
    }
}
echo json_encode($output);
