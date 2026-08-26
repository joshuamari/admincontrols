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
$sectionID = 0;
$prio = 0;
if (!empty($_POST['sectionID'])) {
    $sectionID = $_POST['sectionID'];
    $prio = getMax($sectionID);
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "SectionID Missing";
}
$posID = 0;
if (!empty($_POST['posID'])) {
    $posID = $_POST['posID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "PosID Missing";
}

$toggleState = false;
if (!empty($_POST['toggleState'])) {
    $toggleState = json_decode($_POST['toggleState']);
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "ToggleState Missing";
}
// $offQ = "UPDATE `kdtpositions` SET fldPrio = 0, fldShowManSum = 0 WHERE id=:posID";
// $onQ = "UPDATE `kdtpositions` SET fldPrio=:prio, fldShowManSum = 1 WHERE id=:posID";
$offQ = "UPDATE `designation_list` SET `priority` = 0, `show_man_sum` = 0 WHERE id=:posID";
$onQ = "UPDATE `designation_list` SET `priority`=:prio, `show_man_sum` = 1 WHERE id=:posID";
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        if ($toggleState) {
            $updateStmt = $connnew->prepare($onQ);
            $updateStmt->execute([":prio" => $prio, ":posID" => $posID]);
        } else {
            $updateStmt = $connnew->prepare($offQ);
            $updateStmt->execute([":posID" => $posID]);
        }

        $msg["isSuccess"] = true;
        $msg["message"] = "Update designation successfull";
    }
} catch (Exception $e) {
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);


#region Functions
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
