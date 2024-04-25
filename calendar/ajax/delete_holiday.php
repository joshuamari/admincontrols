<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$msg = array();
$delID = NULL;
if (!empty($_POST['delID'])) {
    $delID = $_POST['delID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Employee Number Missing";
}

$deleteQ = "DELETE FROM `kdtholiday` WHERE fldID=:delID";
$deleteStmt = $connkdt->prepare($deleteQ);
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $deleteStmt->execute([":delID" => $delID]);
        $msg["isSuccess"] = true;
        $msg["message"] = "Deleting holiday successfull";
    }
} catch (Exception $e) {
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);


#region Functions
#endregion
