<?php

class Order {
    private $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function get_all_orders($id)
    {
        $this->db->query('SELECT * FROM orders WHERE id_admin = :id');
        $this->db->bind(':id', $id);
        $res = $this->db->resultSet();
        if($res) {
            return $res;
        } else {
            return false;
        }
    }

    public function get_order($id)
    {
        $this->db->query('SELECT * FROM orders WHERE id = :id');
        $this->db->bind(':id', $id);
        if($this->db->single()) {
            return $this->db->single();
        } else {
            return false;
        }
    }

    public function create($data)
    {
        $this->db->query("INSERT INTO `orders` (`reference`, `order_date`, `id_admin`, `id_customer`, `status`, `tracking`, `total`, `created_at`, `updated_at`) VALUES (:reference, :date_order, :id, :customer, :status, :tracking, :total, :created_at, :updated_at)");

        $this->db->bind(':reference', $data['reference']);
        $this->db->bind(':date_order', $data['date_order']);
        $this->db->bind(':id', $data['admin']);
        $this->db->bind(":customer", $data["customer"]);
        $this->db->bind(":status", "pending");
        $this->db->bind(":tracking", "pending");
        $this->db->bind(":total", $data["total"]);
        $this->db->bind(":created_at", date("Y-m-d H:i:s"));
        $this->db->bind(":updated_at", date("Y-m-d H:i:s"));

        if($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function get_last_insert_order($id)
    {
        $this->db->query('SELECT * FROM orders WHERE id_admin = :id ORDER BY id DESC LIMIT 1');
        $this->db->bind(':id', $id);
        if($this->db->single()) {
            return $this->db->single();
        } else {
            return false;
        }
    }

    public function create_detail($data)
    {
        $this->db->query("INSERT INTO `order_detail` (`id_order`, `id_product`, `quantity`) VALUES (:order, :product, :quantity)");

        $this->db->bind(':order', $data['order']);
        $this->db->bind(":product", $data["product"]);
        $this->db->bind(":quantity", $data["quantity"]);

        if($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function get_last_insert_order_detail()
    {
        $this->db->query('SELECT * FROM order_detail ORDER BY id DESC LIMIT 1');

        if($this->db->single()) {
            return $this->db->single();
        } else {
            return false;
        }
    }

    public function create_order_properties($data)
    {
        $this->db->query("INSERT INTO `order_properties` (`id_order_detail`, `property`, `value`) VALUES (:order_detail, :property, :value)");

        $this->db->bind(':order_detail', $data['order_detail']);
        $this->db->bind(":property", $data["property"]);
        $this->db->bind(":value", $data["value"]);

        if($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function delete($id)
    {
        $this->db->query("DELETE FROM `orders` WHERE `id` = :id");
        $this->db->bind(":id", $id);

        if($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    // jointure between orders and customer

    public function order_customer($id)
    {
        $this->db->query("SELECT * FROM orders INNER JOIN customers ON `orders`.`id_customer` = `customers`.`id` WHERE `orders`.id_admin = :id");
        $this->db->bind(':id', $id);
        $res = $this->db->resultSet();
        if($res) {
            return $res;
        } else {
            return false;
        }
    }

}