<?php
require_once('Crud.php');

class testSubmit {
    private static $table = 'test';
    private static $crud;
    public static function submit($data) {
        self::init();
        if ( empty($data->id) ) {
            $results = self::$crud->create(self::$table,$data);
        }
        else{
            $results = self::$crud->update(self::$table,$data,$data->id,'id');
        }
        return $results;
    }
    private static function init(){
        if( empty(self::$crud) ) {
            self::$crud = new Crud();
        }
    }
}
?>