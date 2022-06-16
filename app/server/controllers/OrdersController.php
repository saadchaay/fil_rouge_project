<?php

    class OrdersController extends Controller {

        private $order ;
        private $customer ;
        private $product ;

        public function __construct()
        {
            header('Access-Control-Allow-Origin: *');
            header('Content-Type: application/json');
            header('Access-Control-Allow-Methods: POST,GET,DELETE,PUT');
            header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');           
            $this->order = new Order();
            $this->customer = new Customer();
            $this->product = new Product();
        }

        public function index($id)
        {   
            $all_orders = $this->order->get_all_orders($id);

            if($_SERVER["REQUEST_METHOD"] == "GET"){
                if($all_orders){
                    http_response_code(201);
                    echo json_encode(array(
                        'orders' => $all_orders,
                        'customers' => $this->customer->get_customers($id),
                    ));
                }else{
                    http_response_code(404);
                    echo json_encode(array('message' => 'No orders found'));
                }
            }
        }

        public function store()
        {
            $dataJSON = json_decode(file_get_contents("php://input"));
            if($_SERVER["REQUEST_METHOD"] == "POST"){
                $admin = $dataJSON->admin ? $dataJSON->admin : "";
                foreach($dataJSON->orders as $order){
                    $customer_id = $this->customer->get_customer_id($order->customer);
                    $orderData = [
                        'reference' => $order->id ? $order->id : "",
                        'date_order' => $order->date ? $order->date : null,
                        'customer' => $customer_id->id,
                        'admin' => $admin,
                        'date' => $order->date ? $order->date : "",
                        'total' => $order->total ? $order->total : "",
                    ];

                    if($this->order->create($orderData)){
                        // get product id 
                        $product_id = $this->product->get_product_id($order->product);

                        // create order_details
                        $detail_order = [
                            'order' => $this->order->get_last_insert_order($admin)->id, // get last insert order
                            'product' => $product_id->id,
                            'quantity' => $order->quantity ? $order->quantity : "",
                        ];
                        if($this->order->create_detail($detail_order)){
                            $order_properties = [
                                'order_detail' => $this->order->get_last_insert_order_detail()->id, // get last insert order
                                'property' => $order->property ? $order->property : "",
                                'value' => $order->value ? $order->value : "",
                            ];
                            print_r($order_properties);
                        } else {
                            http_response_code(500);
                            echo json_encode(array("errors" => "Order not created"));
                        }
                    }


                }
            }
        }

        public function delete($id)
        {
            if($_SERVER["REQUEST_METHOD"] === "DELETE"){
                echo json_encode(array("message" => "Order deleted"));
            }
        }
        
    }