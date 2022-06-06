<?php

class Category {
    private $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function store($data)
    {
        //create a query
        $this->db->query("INSERT INTO `categories` (`name`, `created_at`, `updated_at`) VALUES (:name, :created_at, :updated_at)");

        // bind the values
        $this->db->bind(":name", $data["name"]);
        $this->db->bind(":created_at", date("Y-m-d H:i:s"));
        $this->db->bind(":updated_at", date("Y-m-d H:i:s"));

        // check execution the query
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function get_all_category($data)
    {
        $this->db->query('SELECT * FROM categories WHERE id_creator = :id AND type_creator = :type ORDER BY id DESC');
        $this->db->bind(':id', $data['id']);
        $this->db->bind(':type', $data['type']);
        if($this->db->resultSet()) {
            return $this->db->resultSet();
        } else {
            return false;
        }
    }

    public function create_category($data)
    {
        //create a query
        $this->db->query("INSERT INTO `categories` (`name`, `id_creator`, `type_creator`, `created_at`, `updated_at`) VALUES (:name, :id_creator, :type_creator, :created_at, :updated_at)");

        // bind the values
        $this->db->bind(":name", $data["name"]);
        $this->db->bind(":id_creator", $data["id_creator"]);
        $this->db->bind(":type_creator", $data["type_creator"]);
        $this->db->bind(":created_at", date("Y-m-d H:i:s"));
        $this->db->bind(":updated_at", date("Y-m-d H:i:s"));

        // check execution the query
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }
}