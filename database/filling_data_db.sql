INSERT INTO role (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'client'),
('22222222-2222-2222-2222-222222222222', 'employee'), 
('33333333-3333-3333-3333-333333333333', 'admin');

INSERT INTO order_status (id, name) VALUES 
('44444444-4444-4444-4444-444444444444', 'pending'),
('55555555-5555-5555-5555-555555555555', 'processing'),
('66666666-6666-6666-6666-666666666666', 'shipped'),
('77777777-7777-7777-7777-777777777777', 'delivered'),
('88888888-8888-8888-8888-888888888888', 'cancelled');

INSERT INTO supply_status (id, name) VALUES 
('99999999-9999-9999-9999-999999999999', 'ordered'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'in_transit'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'received'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'cancelled');

INSERT INTO brand (id, name, description) VALUES 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lego', 'Danish toy production company'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Samsung', 'South Korean electronics company'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Apple', 'American technology corporation'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Nike', 'American sports apparel company');

INSERT INTO supplier (id, name, address, phone, email) VALUES 
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'BrickWorld Ltd.', 'Moscow, Brick Street, 15', '+79991111111', 'bricks@world.ru'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ToySupplier Inc.', 'St. Petersburg, Toy Avenue, 25', '+79992222222', 'toys@supplier.ru'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Construction Group', 'Ekaterinburg, Builders Road, 10', '+79993333333', 'construct@group.ru');

INSERT INTO product (id, name, price, age_limit, category_id, brand_id) VALUES 
('11111111-1111-1111-1111-111111111111', 'Lego Titanic', 67999.99, 18, '10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('22222222-2222-2222-2222-222222222222', 'Lego Orchid', 5999.99, 18, '10000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('33333333-3333-3333-3333-333333333333', 'Lego Ferrari Daytona SP3', 49999.99, 18, '10000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('44444444-4444-4444-4444-444444444444', 'Lego Medieval Castle', 25999.99, 9, '10000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('55555555-5555-5555-5555-555555555555', 'Lego Police Station', 17999.99, 6, '10000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('66666666-6666-6666-6666-666666666666', 'Lego Batmobile', 32999.99, 12, '10000000-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('77777777-7777-7777-7777-777777777777', 'Lego Hogwarts Castle', 41999.99, 16, '10000000-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('88888888-8888-8888-8888-888888888888', 'Lego Millennium Falcon', 79999.99, 16, '10000000-0000-0000-0000-000000000015', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('99999999-9999-9999-9999-999999999999', 'Lego Technic Crane', 28999.99, 11, '10000000-0000-0000-0000-000000000016', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lego Classic Brick Box', 2999.99, 4, '10000000-0000-0000-0000-000000000017', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

INSERT INTO product_supplier (id, product_id, supplier_id, quantity) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 5),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 20),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 8),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 25),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 10),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 6),
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 3),
(gen_random_uuid(), '99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 12),
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50);

INSERT INTO "user" (id, name, email, phone, password, role_id) VALUES 
('10000000-0000-0000-0000-000000000001', 'Ivan Ivanov', 'ivan@mail.ru', '+79111111111', 'hashed_password_1', '11111111-1111-1111-1111-111111111111'),
('10000000-0000-0000-0000-000000000002', 'Petr Petrov', 'petr@mail.ru', '+79112222222', 'hashed_password_2', '11111111-1111-1111-1111-111111111111'),
('10000000-0000-0000-0000-000000000003', 'Anna Sidorova', 'anna@mail.ru', '+79113333333', 'hashed_password_3', '11111111-1111-1111-1111-111111111111'),
('10000000-0000-0000-0000-000000000004', 'Maria Kozlova', 'maria@lego-store.ru', '+79114444444', 'hashed_password_4', '22222222-2222-2222-2222-222222222222'),
('10000000-0000-0000-0000-000000000005', 'Alexey Smirnov', 'alex@lego-store.ru', '+79115555555', 'hashed_password_5', '33333333-3333-3333-3333-333333333333');

INSERT INTO client (id, birthday) VALUES 
('10000000-0000-0000-0000-000000000001', '1990-05-15'),
('10000000-0000-0000-0000-000000000002', '1985-08-20'),
('10000000-0000-0000-0000-000000000003', '1995-12-10');

INSERT INTO employee (id, passport_series, passport_number) VALUES 
('10000000-0000-0000-0000-000000000004', '4505', '123456');

INSERT INTO admin (id, passport_series, passport_number) VALUES 
('10000000-0000-0000-0000-000000000005', '4506', '654321');

INSERT INTO cart (id, client_id) VALUES 
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003');

INSERT INTO cart_item (id, cart_id, product_id, quantity) 
SELECT 
    gen_random_uuid(),
    c.id,
    p.id,
    CASE 
        WHEN p.name LIKE '%Titanic%' THEN 1
        WHEN p.name LIKE '%Orchid%' THEN 2
        ELSE FLOOR(RANDOM() * 3) + 1
    END
FROM cart c
CROSS JOIN product p
WHERE c.client_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
LIMIT 15;

INSERT INTO "order" (id, client_id, order_date, delivery_date, status_id, total_amount) VALUES 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2024-01-15 10:30:00', '2024-01-18 14:00:00', '77777777-7777-7777-7777-777777777777', 73999.98),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2024-01-16 11:45:00', NULL, '55555555-5555-5555-5555-555555555555', 25999.99),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2024-01-20 09:15:00', NULL, '44444444-4444-4444-4444-444444444444', 5999.99);

INSERT INTO order_item (id, order_id, product_id, quantity, unit_price) VALUES 
(gen_random_uuid(), '20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 1, 67999.99),
(gen_random_uuid(), '20000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 1, 5999.99),
(gen_random_uuid(), '20000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 1, 25999.99),
(gen_random_uuid(), '20000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 1, 5999.99);

INSERT INTO review (id, client_id, product_id, comment, rating) VALUES 
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Amazing detail! Took me 2 weeks to build but worth every minute!', 5),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Beautiful orchid, looks real on my desk. Great quality!', 5),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'My son loves this castle! Good price for the number of pieces.', 4);

INSERT INTO discount_product (id, product_id, percent, start_date, end_date) VALUES 
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15.00, '2024-01-20', '2024-02-20'),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 10.00, '2024-01-25', '2024-02-10');

INSERT INTO discount_category (id, category_id, percent, start_date, end_date) VALUES 
(gen_random_uuid(), '10000000-0000-0000-0000-000000000017', 20.00, '2024-01-15', '2024-02-15');

INSERT INTO supply (id, supplier_id, supply_date, status_id, total_quantity) VALUES 
('30000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-10', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 50),
('30000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-12', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 35);

INSERT INTO supply_item (id, supply_id, product_id, quantity_for_delivery, unit_cost) VALUES 
(gen_random_uuid(), '30000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 5, 55000.00),
(gen_random_uuid(), '30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 15, 4500.00),
(gen_random_uuid(), '30000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 8, 40000.00),
(gen_random_uuid(), '30000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 12, 20000.00);

INSERT INTO user_log (id, user_id, action, created_at) VALUES 
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'User logged in', '2024-01-15 10:25:00'),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'Order created: 20000000-0000-0000-0000-000000000001', '2024-01-15 10:30:00'),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'User logged in', '2024-01-16 11:40:00'),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'Admin updated product price', '2024-01-17 14:20:00');
