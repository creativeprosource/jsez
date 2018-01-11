<?php 
include("class_lib.php");
$this_request = new request();

//$res=$this_request->get_request();
//print_r($res);
//echo json_encode($this_request->get_query());

$query=$this_request->get_query();
if(isset($query['json']))
{
    echo $query['json'];
}
else
{
    echo json_encode($query);
}
return;
?>