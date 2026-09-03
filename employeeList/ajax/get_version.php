<?php
$ajaxArr = $_REQUEST["busterCall"];
$titleName = $_REQUEST["titleName"];
$headString = "<title>$titleName</title>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<meta charset='UTF-8'>
<link rel='stylesheet' href='../tailwindcss.min.css'><!--COMMON-->
<link rel='stylesheet' href='css/index.css'>
<script src='js/jquery.js'></script><!--COMMON-->
<script src='../tailwindcss.js'></script><!--COMMON-->
<script src='js/lucide.min.js'></script>";
$addString = "";
foreach ($ajaxArr as $element) {
    switch (explode("/", $element)[0]) {
        case "js":
            $version = date("YmdHis", filemtime("../$element"));
            $addString .= "<script src='$element?version=$version'></script>";
            break;
        case "css":
            $version = date("YmdHis", filemtime("../$element"));
            $addString .= "<link rel='stylesheet' type='text/css' href='$element?v=$version'>";
            break;
    }
}
echo $headString . $addString;
?>
