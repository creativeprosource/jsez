<?php
    /**************************************************************************
     * webService.php created by Dave Bailey
     * handles all ajax calls made with jsez.js
     * by calling a method in the named class with the supplied parameters
     ***************************************************************************/
    if (!isset($_REQUEST['className']) && !isset($_REQUEST['methodCalled'])) {
        exit(json_encode(array(false, "Error webservice missing required parameters")));
    }

    $parametersArray = ((isset($_POST['parametersArray'])) ? json_decode($_POST['parametersArray']) : null);

    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        $parametersArray = $_GET;
        unset($parametersArray['className']);
        unset($parametersArray['methodCalled']);
    }

    if (!class_exists($_REQUEST['className'])) {
        $classPath = './classes/' . $_REQUEST['className'] . '.php';
        try {
            if (!file_exists($classPath )) {
                throw new Exception ($_REQUEST['className'].' class does not exist');
            } else {
                require_once($classPath);
            }
        }
        catch(Exception $e) {
            exit(json_encode(array(false, "Error : " . $e->getMessage())));
        }
    }

    if (empty($parametersArray)) {
        $res = call_user_func(array($_REQUEST['className'], $_REQUEST['methodCalled']));
    } else {
        if ( !is_array($parametersArray) ) {
            $parametersArray = array($parametersArray);
        }
        $res = call_user_func_array(array($_REQUEST['className'], $_REQUEST['methodCalled']), $parametersArray);
    }
    if (!$res) $res = array(false, "Web service failed");
    exit(json_encode($res));

?>