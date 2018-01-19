<?php
/**
 * Created by dave bailey
 * Configures and creates a database connection
 * to be used with Crud.php for all database queries
 * DEBUG should be defined as true or false in site globals
 */
define('DEBUG', true);
class DbConnect
{
    private $driver    = 'mysql';
    private $host      = 'localhost';
    private $port      = '3306';
    private $charset   = 'utf8';
    private $user = 'root';
    private $password = 'Test123!';
    private $options = [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_EMULATE_PREPARES   => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING
    ];

    protected $schema = 'test';
    protected $connection;

    public function __construct()
    {
        if ( empty($this->connection) ) {
            $dsn = "$this->driver:host=$this->host;dbname=$this->schema;port=$this->port;charset=$this->charset";
            try {
                $this->connection = new PDO($dsn, $this->user, $this->password, $this->options);
            } catch (PDOException $e) {
                error_log("Failed to connect, the error message is: " . $e->getMessage() );
            }
        }
    }
    protected function execute($sql,$params = false,$returnResults = true) {
        try {
            if (empty($sql)) {
                return array(false,"Missing query string");
            }
            error_log($sql);
            if ($params) {
                $statement = $this->connection->prepare($sql);
                $statement->execute($params);
            } else {
                $statement = $this->connection->query($sql);
            }
            if ((!$statement || $statement->rowCount() < 1) && $returnResults) {
                return array(false,"No results");
            }
            return $statement;
        } catch (PDOException $e) {
            return array(false, "A database error has occured." . ((DEBUG) ? " The error is: ".$this->connection->e->getMessage() : ""));
        }
    }
}

?>