Table role {
  id uuid [primary key]
  name varchar(50) [not null, unique]
}

Table order_status {
  id uuid [primary key]
  name varchar(50) [not null, unique]
}

Table supply_status {
  id uuid [primary key]
  name varchar(50) [not null, unique]
}

Table category {
    id uuid [primary key]
    name varchar(100) [not null]
    description text
}

Table brand {
    id uuid [primary key]
    name varchar(100) [not null]
    description text
}

Table supplier {
    id uuid [primary key]
    name varchar(150) [not null]
    address text [not null]
    product_ids text [not null]
}

Table product {
    id uuid [primary key]
    name varchar(150) [not null]
    price decimal(10,2) [not null]
    age_limit int [not null]
    category_id uuid [not null]
    brand_id uuid [not null]
    supplier_id uuid [not null]
    quantity int [not null]
}

Table discount {
    id uuid [primary key]
    category_id uuid [not null]
    product_id uuid [not null]
    percent decimal(5,2) [not null]
    start_date date [not null]
    end_date date [not null]
}

Table supply {
    id uuid [primary key]
    supplier_id uuid [not null]
    supply_date date [not null]
    status_id uuid [not null] 
}

Table supply_item {
    id uuid [primary key]
    supply_id uuid [not null]
    product_id uuid [not null]
    quantity_for_delivery int [not null]
}

Table user {
    id uuid [primary key]
    name varchar(100) [not null]
    email varchar(100) [not null, unique]
    phone varchar(20) [not null, unique]
    password varchar(255) [not null]
    role_id uuid [not null]
}

Table client {
    id uuid [primary key]
    birthday date [not null]
}

Table admin {
    id uuid [primary key]
    passport_series varchar(10)
    passport_number varchar(20)
}

Table employee {
    id uuid [primary key]
    passport_series varchar(10)
    passport_number varchar(20)
}

Table order {
    id uuid [primary key]
    client_id uuid [not null]
    order_date datetime
    delivery_date datetime
    status_id uuid [not null]
}

Table order_item {
    id uuid [primary key]
    order_id uuid [not null]
    product_id uuid [not null]
    quantity int [not null]
}

Table cart{
    id uuid [primary key]
    client_id uuid [not null]
    quantity int [not null]
}

Table cart_item {
    id uuid [primary key]
    cart_id uuid [not null]
    product_id uuid [not null]
    quantity int [not null]
}

Table review {
    id uuid [primary key]
    client_id uuid [not null]
    product_id uuid [not null]
    comment text [not null]
    rating int [not null] // constraint: rating >= 1 AND rating <= 5
  
    indexes {
      (product_id, rating)
      client_id
    }
}

Table user_log {
    id uuid [primary key]
    user_id uuid [not null]
    action varchar(255) [not null]
    created_at datetime [not null]
}

Ref: user.role_id > role.id
Ref: order.status_id > order_status.id
Ref: supply.status_id > supply_status.id

Ref: product.category_id > category.id
Ref: product.brand_id > brand.id

Ref: supplier.product_ids > product.id  
Ref: product.supplier_id > supplier.id

Ref: supply_item.supply_id > supply.id
Ref: supply_item.product_id > product.id

Ref: supply.supplier_id > supplier.id

Ref: discount.product_id > product.id
Ref: discount.category_id > category.id

Ref: order.client_id > client.id
Ref: order_item.order_id > order.id
Ref: order_item.product_id > product.id

Ref: cart.client_id > client.id
Ref: cart_item.cart_id > cart.id
Ref: cart_item.product_id > product.id

Ref: review.client_id > client.id
Ref: review.product_id > product.id

Ref: user_log.user_id > user.id

Ref: client.id < user.id
Ref: admin.id < user.id 
Ref: employee.id < user.id 
