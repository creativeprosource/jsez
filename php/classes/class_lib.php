<?php 
class request {
//properties
	var $req=array();
	
function __construct() {
		$this->req['METHOD']=$_SERVER['REQUEST_METHOD'];
		$this->req['URI']=$_SERVER['REQUEST_URI'];
		$this->req['QUERY']=array();
		switch (strtoupper ($_SERVER['REQUEST_METHOD'])) {
			case 'DELETE':
			case 'PUT':
			case 'POST':
				$this->req['QUERY']=$_POST;
				break;
			case 'GET':
				parse_str( $_SERVER['QUERY_STRING'], $this->req['QUERY'] );
				break;
			default:
				break;
			}
		// $this->req['QUERY'] = $this->clean_query( $this->req['QUERY'] ); // clean an assoc array of the query string.
		}
	
//methods	
	public function clean_query($q) {
		foreach ($q as $clean) {
		//	$clean=mysql_real_escape_string($clean);
		}
		unset($clean);	
		return $q;
		} // end clean_query
	
	public function get_request() {
		return $this->req;
		} // end qet_request
    public function get_query() {
        return $this->req['QUERY'];
    } // end qet_request

} // end request class
?>