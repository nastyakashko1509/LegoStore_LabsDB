-- Скрипт для обновления процедур с поддержкой user_id
-- Выполните этот скрипт в pgAdmin Query Tool или через psql

-- Обновление процедуры register_supply
CREATE OR REPLACE PROCEDURE register_supply(
    p_supplier_id UUID,
    p_supply_date DATE,
    p_status_name VARCHAR(50),
    p_supply_items JSONB,
    p_employee_id UUID DEFAULT NULL  
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_supply_id UUID;
    v_status_id UUID;
    supply_item JSONB;
BEGIN
    SELECT id INTO v_status_id FROM supply_status WHERE name = p_status_name;
    
    INSERT INTO supply (supplier_id, supply_date, status_id)
    VALUES (p_supplier_id, p_supply_date, v_status_id)
    RETURNING id INTO v_supply_id;
    
    FOR supply_item IN SELECT * FROM jsonb_array_elements(p_supply_items)
    LOOP
        INSERT INTO supply_item (supply_id, product_id, quantity_for_delivery, unit_cost)
        VALUES (
            v_supply_id,
            (supply_item->>'product_id')::UUID,
            (supply_item->>'quantity')::INT,
            (supply_item->>'unit_cost')::DECIMAL
        );
    END LOOP;
    
    IF p_employee_id IS NOT NULL THEN
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (
            p_employee_id,
            'Зарегистрирована поставка: ' || v_supply_id, 
            CURRENT_TIMESTAMP
        );
    END IF;
    
    COMMIT;
END;
$$;

-- Обновление процедуры set_product_discount
CREATE OR REPLACE PROCEDURE set_product_discount(
    p_product_id UUID,
    p_percent DECIMAL(5,2),
    p_start_date DATE,
    p_end_date DATE,
    p_user_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM discount_product WHERE product_id = p_product_id) THEN
        UPDATE discount_product 
        SET percent = p_percent,
            start_date = p_start_date,
            end_date = p_end_date,
            created_at = CURRENT_TIMESTAMP
        WHERE product_id = p_product_id;
    ELSE
        INSERT INTO discount_product (product_id, percent, start_date, end_date)
        VALUES (p_product_id, p_percent, p_start_date, p_end_date);
    END IF;
    
    IF p_user_id IS NOT NULL THEN
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (p_user_id, 'Установлена скидка на товар: ' || p_product_id, CURRENT_TIMESTAMP);
    END IF;
    
    COMMIT;
END;
$$;

-- Обновление процедуры update_product_price
CREATE OR REPLACE PROCEDURE update_product_price(
    p_product_id UUID,
    p_new_price DECIMAL(10,2),
    p_user_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE product 
    SET price = p_new_price 
    WHERE id = p_product_id;
    
    IF p_user_id IS NOT NULL THEN
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (p_user_id, 'Изменена цена товара: ' || p_product_id, CURRENT_TIMESTAMP);
    END IF;
    
    COMMIT;
END;
$$;


