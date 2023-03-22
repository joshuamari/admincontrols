<?php
// $rawJSDateChange=filemtime("../js/main.js");
// $wrsJSVersion=date("Ymd",$rawJSDateChange);
// echo $wrsJSVersion;
$ajaxArr = $_REQUEST["busterCall"];
$titleName = $_REQUEST["titleName"];
$headString="<title>$titleName</title>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<meta charset='UTF-8'>
<link rel='stylesheet' href='css/neoBootstrap.css'><!--COMMON-->
<link rel='stylesheet' href='css/boxicons.css'><!--COMMON-->
<link rel='stylesheet' href='css/index.css'>
<script src='js/jquery.js'></script><!--COMMON-->
<script src='js/neoBootstrap.js'></script><!--COMMON-->";
$addString = "";
//ADD TO ULI SA HEADSTRING BAT DI NAGANA
// <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
foreach($ajaxArr AS $element){
    switch(explode("/",$element)[0]){
        case "js":
            $version = date("YmdHis",filemtime("../$element"));
            $addString .= "<script src='$element?version=$version'></script>";
            break;
        case "css":
            $version = date("YmdHis",filemtime("../$element"));
            $addString .= "<link rel='stylesheet' type='text/css' href='$element?v=$version'>";
            break;
    }
}
echo $headString.$addString;
?>