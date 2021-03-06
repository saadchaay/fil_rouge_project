<?php

    class OrdersController extends Controller {

        private $order ;
        private $customer ;
        private $product ;
        private $note ;

        public function __construct()
        {
            header('Access-Control-Allow-Origin: *');
            header('Content-Type: application/json');
            header('Access-Control-Allow-Methods: POST,GET,DELETE,PUT');
            header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');           
            $this->order = new Order();
            $this->customer = new Customer();
            $this->product = new Product();
            $this->note = new Note();
        }

        public function index($id)
        {   
            $all_orders = $this->order->order_customer($id);

            if($_SERVER["REQUEST_METHOD"] == "GET"){
                if($all_orders){
                    http_response_code(201);
                    echo json_encode($all_orders);
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'No orders found'));
                }
            }
        }

        public function store()
        {
            $dataJSON = json_decode(file_get_contents("php://input"));
            $is_success = 0;
            $noProduct = true;

            if($_SERVER["REQUEST_METHOD"] == "POST"){
                $admin = $dataJSON->admin ? $dataJSON->admin : "";
                $productErr = '';
                $orderErr = '';
                $countOr = count(array($dataJSON->orders));
                foreach($dataJSON->orders as $order){ 
                    $customer_id = $this->customer->get_customer_id($order->customer, $admin);
                    // check if customer exist
                    if(!$customer_id){
                        if($this->customer->create(array(
                            'id' => $admin,
                            'name' => $order->customer,
                            'phone' => $order->phone,
                            'address' => $order->address,
                            'city' => $order->city,
                        ))){
                            $newCustomer = $this->customer->get_customer_id($order->customer, $admin);
                        }
                    }
                    $orderData = [
                        'reference' => $order->id ? $order->id : "",
                        'date_order' => $order->date ? $order->date : null,
                        'customer' => $customer_id ? $customer_id->id : $newCustomer->id,
                        'admin' => $admin,
                        'total' => $order->total ? $order->total : "",
                    ];
                    $statusCreation = $this->order->check_order_ref($orderData['reference']);
                    if(!$statusCreation){
                        if($this->order->create($orderData)){
                            // get product id 
                            $product_id = $this->product->get_product_id($order->sku);
                            if(!$product_id){
                                $this->order->delete($this->order->get_last_insert_order($admin)->id);
                                $productErr = 'Some product not found';
                                $noProduct = false;
                                break;
                            }
                            // create order_details
                            $detail_order = [
                                'order' => $this->order->get_last_insert_order($admin)->id, // get last insert order
                                'product' => $product_id->id, // get last insert product),
                                'quantity' => $order->quantity ? $order->quantity : "",
                            ];
                            if($this->order->create_detail($detail_order)){
                                $colors = explode(",", $order->colors);
                                $sizes = explode(",", $order->sizes);
                                $order_properties = [
                                    'order_detail' => $this->order->get_last_insert_order_detail()->id, // get last insert order
                                    'colors' => $colors,
                                    'sizes' => $sizes
                                ];
                                foreach($order_properties['colors'] as $color){
                                    $tmp = [
                                        'property' => "color",
                                        'value' => $color,
                                        'order_detail' => $order_properties['order_detail'],
                                    ];
                                    $this->order->create_order_properties($tmp);
                                }
                                foreach($order_properties['sizes'] as $size){
                                    $tmp = [
                                        'property' => "size",
                                        'value' => $size,
                                        'order_detail' => $order_properties['order_detail'],
                                    ];
                                    $this->order->create_order_properties($tmp);
                                }
                                $is_success += 1;
                                $orderErr = 'Some Order already exist';
                            } else {
                                $this->order->delete($this->order->get_last_insert_order($admin)->id);
                            }
                        } else {
                            print_r("error");
                            $this->customer->delete($newCustomer->id);
                        }
                    } else {
                        $orderErr = 'Some Order already exist';
                    }
                }
                if(($is_success < $countOr)){
                    http_response_code(200);
                    echo json_encode(array('message' => $orderErr));
                }elseif($is_success == 0){
                    http_response_code(200);
                    if(!$noProduct){
                        echo json_encode(array('message' => $productErr));
                    }else{
                        echo json_encode(array('message' => 'No orders imported'));
                    }
                }else {
                    http_response_code(201);
                    echo json_encode(array('message' => 'Orders Imported', 'data' => $is_success.','.$countOr));
                }
            }
        }

        public function destroy($id)
        {
            if($_SERVER["REQUEST_METHOD"] === "DELETE"){
                $order = $this->order->get_order($id);
                if($order){
                    if($this->order->delete($id)){
                        http_response_code(200);
                        echo json_encode(array('message' => 'Order deleted'));
                    }else{
                        http_response_code(500);
                        echo json_encode(array('message' => 'Error deleting order'));
                    }
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'Order not found'));
                }
            }
        }

        public function show($id)
        {
            if($_SERVER["REQUEST_METHOD"] === "GET"){
                $order = $this->order->get_join_all($id);
                $product = $this->product->get_product($order->id_product);
                $customer = $this->customer->get_customer($order->id_customer);
                $total = $this->customer->get_all_transaction($order->id_customer);
                $properties = $this->order->get_order_properties($order->id);
                if($order){
                    http_response_code(200);
                    echo json_encode(array('order' => $order, 'customer' => $customer, 'product' => $product, 'total' => $total, 'properties' => $properties));
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'Order not found'));
                }
            }
        }

        public function total_transaction($id)  
        {
            echo json_encode(array('total' => $this->customer->get_all_transaction($id)));
        }

        public function changeStatus($id)
        {
            $dataJSON = json_decode(file_get_contents("php://input"));
            if($_SERVER["REQUEST_METHOD"] === "PUT"){
                $order = $this->order->get_order($id);
                if($order){
                    if($this->order->change_status($id, $dataJSON->status)){
                        if(!empty($dataJSON->note)){
                            $this->note->create([
                                'id' => $id,
                                'belongTo' => $dataJSON->belongTo,
                                'note' => $dataJSON->note,
                            ]);
                        }
                        http_response_code(200);
                        echo json_encode(array('message' => 'Order status updated'));
                    }else{
                        http_response_code(500);
                        echo json_encode(array('message' => 'Error updating order status'));
                    }
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'Order not found'));
                }
            }
        }
        
        public function changeTracking($id)
        {
            $dataJSON = json_decode(file_get_contents("php://input"));
            if($_SERVER["REQUEST_METHOD"] === "PUT"){
                $order = $this->order->get_order($id);
                if($order){
                    if($this->order->change_tracking($id, $dataJSON->status)){
                        if(!empty($dataJSON->note)){
                            $this->note->create([
                                'id' => $id,
                                'belongTo' => $dataJSON->belongTo,
                                'note' => $dataJSON->note,
                            ]);
                        }
                        http_response_code(200);
                        echo json_encode(array('message' => 'Order status updated'));
                    }else{
                        http_response_code(500);
                        echo json_encode(array('message' => 'Error updating order status'));
                    }
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'Order not found'));
                }
            }
        }

        public function confirmedOrders($id)
        {
            $all_orders = $this->order->get_confirmed_order($id);

            if($_SERVER["REQUEST_METHOD"] == "GET"){
                if($all_orders){
                    http_response_code(201);
                    echo json_encode($all_orders);
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'No orders found'));
                }
            }
        }
        
    }