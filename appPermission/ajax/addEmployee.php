<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectqms.php';
require_once '../Includes/formsdb.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$fname='';
if(!empty($_POST['fname'])){
    $fname=$_POST['fname'];
}
$lname='';
if(!empty($_POST['lname'])){
    $lname=$_POST['lname'];
}
$fullName=strtoupper(($lname))."_".$fname;
$nname='';
if(!empty($_POST['nname'])){
    $nname=$_POST['nname'];
}
$bday='';
if(!empty($_POST['bday'])){
    $bday=$_POST['bday'];
}
$gender='';
if(!empty($_POST['gender'])){
    $gender=$_POST['gender'];
}
$status='';
if(!empty($_POST['status'])){
    $status=$_POST['status'];
}
$empnum='';
if(!empty($_POST['empnum'])){
    $empnum=$_POST['empnum'];
}
$username='';
if(!empty($_POST['username'])){
    $username=$_POST['username'];
}
$group='';
if(!empty($_POST['group'])){
    $group=$_POST['group'];
}
$dhired='';
if(!empty($_POST['dhired'])){
    $dhired=$_POST['dhired'];
}
$position='';
if(!empty($_POST['position'])){
    $position=$_POST['position'];
}
$email='';
if(!empty($_POST['email'])){
    $email=$_POST['email'];
}
$addHash=password_hash($username, PASSWORD_DEFAULT);
$addPic="pic_".$empnum.".jpg";
$addLotus=$email."/P/KHI";
$addOutlook=$email."@corp.khi.co.jp";
$mode=0;
if(isset($_POST['mode'])){
    $mode=$_POST['mode'];
}
#endregion

#region main
if($mode==0){
    $insertQMSquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
    VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertQMSstmt = $connqms->prepare($insertQMSquery);
    $insertQMSstmt->execute([":empnum"=>$empnum,":username"=>$username,":fullName"=>$fullName,":lname"=>$lname,":fname"=>$fname,":nname"=>$nname,":group"=>$group,":position"=>$position,":bday"=>$bday,":cstatus"=>$status,":dhired"=>$dhired,":addLotus"=>$addLotus,":addPic"=>$addPic,":gender"=>$gender]);

    $insertKDTquery = "INSERT INTO emp_prof(fldEmployeeNum,fldUser,fldName,fldSurname,fldFirstname,fldNick,fldGroup,fldDesig,fldBirthDate,fldStatus,fldDateHired,fldLotus,fldPic,fldGender)  
    VALUES (:empnum,:username,:fullName,:lname,:fname,:nname,:group,:position,:bday,:cstatus,:dhired,:addLotus,:addPic,:gender)";
    $insertKDTstmt = $connkdt->prepare($insertKDTquery);
    $insertKDTstmt->execute([":empnum"=>$empnum,":username"=>$username,":fullName"=>$fullName,":lname"=>$lname,":fname"=>$fname,":nname"=>$nname,":group"=>$group,":position"=>$position,":bday"=>$bday,":cstatus"=>$status,":dhired"=>$dhired,":addLotus"=>$addLotus,":addPic"=>$addPic,":gender"=>$gender]);

    $insertEntryLogs = "INSERT INTO entry_logs(fldEmployeeNum)  
    VALUES (:empnum)";
    $insertEntryLogsstmt = $connqms->prepare($insertEntryLogs);
    $insertEntryLogsstmt->execute([":empnum"=>$empnum]);

    $insertKDTLoginquery = "INSERT INTO kdtlogin(fldUser,fldUserHash,fldPw,fldOutlook,fldLotus,fldEmployeeNum)  
    VALUES (:username,:addHash,'kdtpass',:addOutlook,:addLotus,:empnum)";
    $insertKDTLoginStmt = $connkdt->prepare($insertKDTLoginquery);
    $insertKDTLoginStmt->execute([":username"=>$username,":addHash"=>$addHash,":addOutlook"=>$addOutlook,":addLotus"=>$addLotus,":empnum"=>$empnum]);

    $insertKDTOptionquery = "INSERT INTO kdtoptions(fldEmployeeNumber,fldUser)  
    VALUES (:empnum,:username)";
    $insertKDTOptionStmt = $connkdt->prepare($insertKDTOptionquery);
    $insertKDTOptionStmt->execute([":empnum"=>$empnum,":username"=>$username]);

    $insertLeaveFormCountQ="INSERT INTO leave_confirmation(lc_eid) VALUES(:empnum)";
    $insertLeaveFormCountStmt = $connforms->prepare($insertLeaveFormCountQ);
    $insertLeaveFormCountStmt->execute([":empnum"=>$empnum]);
}
if($mode==1){
    $editQMSQuery="UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editQMSStmt=$connqms->prepare($editQMSQuery);
    $editQMSStmt->execute([":fullName"=>$fullName,":lname"=>$lname,":fname"=>$fname,":nname"=>$nname,":username"=>$username,":group"=>$group,":position"=>$position,":bday"=>$bday,":gender"=>$gender,":cstatus"=>$status,":dhired"=>$dhired,":addLotus"=>$addLotus,":empnum"=>$empnum]);

    $editKDTQuery="UPDATE emp_prof SET fldName=:fullName,fldSurname=:lname,fldFirstname=:fname,fldNick=:nname,fldUser=:username,fldGroup=:group,fldDesig=:position,fldBirthDate=:bday,fldGender=:gender,fldStatus=:cstatus,fldDateHired=:dhired,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTStmt=$connkdt->prepare($editKDTQuery);
    $editKDTStmt->execute([":fullName"=>$fullName,":lname"=>$lname,":fname"=>$fname,":nname"=>$nname,":username"=>$username,":group"=>$group,":position"=>$position,":bday"=>$bday,":gender"=>$gender,":cstatus"=>$status,":dhired"=>$dhired,":addLotus"=>$addLotus,":empnum"=>$empnum]);

    $editKDTLoginQuery="UPDATE kdtlogin SET fldOutlook=:addOutlook,fldLotus=:addLotus WHERE fldEmployeeNum=:empnum";
    $editKDTLoginStmt=$connkdt->prepare($editKDTLoginQuery);
    $editKDTLoginStmt->execute([":addOutlook"=>$addOutlook,":addLotus"=>$addLotus,":empnum"=>$empnum]);
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
?>