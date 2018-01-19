<?php
/******************************************************************************************************
 * Crud.php
 * create, read, update, delete
 *******************************************************************************************************/

require_once('DbConnect.php');

class Crud extends DbConnect
{
    protected $structures;

    function __construct()
    {
        parent::__construct();
    }

    private function getStructure($table)
    {
        if (!isset($table)) {
            return array(false, "Missing table parameter");
        }
        if (!empty($this->structures[$table])) {
            return array(true, $this->structures[$table]);
        }
        $sql = "SHOW COLUMNS FROM " . $this->schema . "." . $table;
        $statement = $this->execute($sql);
        if (is_array($statement)) {
            return $statement;
        }
        $structure = array();
        foreach ($statement as $row) {
            $column = $row->Field;
            $structure[$column] = new stdClass;
            $structure[$column]->type = strtok($row->Type, '()');
            $structure[$column]->size = intval(strtok('()'));
            $structure[$column]->primaryKey = (($row->Key == 'PRI') ? $column : FALSE);
            $structure[$column]->notNull = (($row->Null == 'NO') ? TRUE : FALSE);
            $structure[$column]->serial = (($row->Extra == 'auto_increment') ? TRUE : FALSE);
            $structure[$column]->value = $this->testIfNull($structure[$column]);
        }
        $this->structures[$table] = $structure;
        return array(true,$structure);
    }

    public function create($table, $data)
    {
        if (!isset($table, $data)) {
            return array(false, "Missing parameter");
        }
        $structure = $this->getStructure($table);
        if (!$structure[0]) {
            return $structure;
        }
        $structure = $structure[1];
        $columns = array();
        $paramNames = array();
        $params = false;
        foreach ($data as $column => $value) {
        if (isset($structure[$column]) && !$structure[$column]->primaryKey && !$structure[$column]->serial) {
                $paramNames[] = ":" . $column;
                $columns[] = $column;
                if($structure[$column]->type == 'json' && !is_string($value)){
                    $value = json_encode($value);
                }
                $params[":" . $column] = $this->testIfNull($structure[$column], $value);
            }
        }
        $table = $this->schema . "." . $table;
        $sql = "INSERT INTO $table (" . implode(",", $columns) . ") VALUES (" . implode(",", $paramNames) . ")";
        $statement = $this->execute($sql, $params, false);
        if (is_array($statement)) {
            return $statement;
        }
        return array(true, $this->connection->lastInsertId());
    }

    public function read($table, $keyValue, $keyName = 'id')
    {
        if (!isset($table)) {
            return array(false, "Missing parameter");
        }
        if (empty($keyValue)) {
            return $this->getEmptyRecord($table);
        }
        $table = $this->schema . "." . $table;
        $sql = "SELECT * FROM $table WHERE $keyName = :keyValue";
        $params = array(':keyValue' => $keyValue);
        $statement = $this->execute($sql, $params, true);
        if (is_array($statement)) {
            // an error occured
            return $statement;
        }
        return array(true, $statement->fetch(PDO::FETCH_OBJ));
    }

    public function getEmptyRecord($table)
    {
        if (!isset($table)) {
            return array(false, "Missing parameter");
        }
        $structure = $this->getStructure($table);
        if (!$structure[0]) {
            return $structure;
        }
        $struct = array();
        foreach ($structure[1] as $column => $properties) {
            $struct[$column] = $properties->value;
        }
        return array(true, (object)$struct);
    }

    public function update($table, $data, $keyValue, $keyName = 'id')
    {
        if (!isset($table, $data, $keyValue)) {
            return array(false, "Missing parameter");
        }

        $structure = $this->getStructure($table);
        if (!$structure[0]) {
            return $structure;
        }
        $structure = $structure[1];
        $columns = array();
        $paramNames = array();
        $params = array(':keyValue' => $keyValue);
        foreach ($data as $column => $value) {
            if (isset($structure[$column]) && (!$structure[$column]->primaryKey && !$structure[$column]->serial)) {
                $paramNames[] = ":" . $column;
                $columns[] = $column;
                if($structure[$column]->type == 'json' && !is_string($value)){
                    $value = json_encode($value);
                }
                $params[":" . $column] = ((empty($value) || $value === 'null') && ($column->notNull || $column->primaryKey)
                    ? $structure[$column]->value
                    : $value);
            }
        }
        $table = $this->schema . "." . $table;
        $sql = "UPDATE $table set (" . implode(",", $columns) . ") = (" . implode(",", $paramNames) . ") WHERE $keyName = :keyValue";
        $statement = $this->execute($sql, $params, false);
        if (is_array($statement)) {
            // an error occured
            return $statement;
        }
        return array(true, "Record was updated successfully");
    }

    public function delete($table, $keyValue, $keyName = 'id')
    {
        if (!isset($table, $keyValue)) {
            return array(false, "Missing parameter");
        }
        $table = $this->schema . "." . $table;
        $params = array(':keyValue' => $keyValue);
        $sql = "DELETE from $table  WHERE $keyName = :keyValue";
        $statement = $this->execute($sql, $params, false);
        if (is_array($statement)) {
            // an error occured
            return $statement;
        }
        return array(true, "Record was deleted successfully");
    }

    private function testIfNull($column, $value = null)
    {
        if ((empty($value) || $value === 'null') && ($column->notNull || $column->primaryKey)) {
            switch ($column->type) {
                case 'boolean':
                case 'bool':
                case 'tinyint':
                case 'mediumint':
                case 'int':
                case 'bigint':
                case 'integer':
                    $value = 0;
                    break;
                case 'decimal':
                case 'float':
                case 'double':
                case 'numeric':
                    $value = 0.0;
                    break;
                case 'varchar':
                case 'text':
                case 'longtext':
                case 'mediumtext':
                    $value = '';
                    break;
                case 'date':
                    $value = date("Y-m-d");
                    break;
                case 'datetime':
                    $value = date("Y-m-d H:i:s");
                    break;
                default:
                    $value = null;
                    break;
            }
        }
        return $value;
    }
}

?>