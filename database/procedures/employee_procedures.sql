-- Процедура регистрации поставки
CREATE OR REPLACE PROCEDURE register_supply(
    p_supplier_id UUID,
    p_supply_date DATE,
    p_status_name VARCHAR(50),
    p_supply_items JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_supply_id UUID;
    v_status_id UUID;
    supply_item JSONB;
BEGIN
    -- Получаем ID статуса
    SELECT id INTO v_status_id FROM supply_status WHERE name = p_status_name;
    
    -- Создаем поставку
    INSERT INTO supply (supplier_id, supply_date, status_id)
    VALUES (p_supplier_id, p_supply_date, v_status_id)
    RETURNING id INTO v_supply_id;
    
    -- Добавляем товары поставки
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
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (NULL, 'Зарегистрирована поставка: ' || v_supply_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура установки скидки на товар
CREATE OR REPLACE PROCEDURE set_product_discount(
    p_product_id UUID,
    p_percent DECIMAL(5,2),
    p_start_date DATE,
    p_end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO discount_product (product_id, percent, start_date, end_date)
    VALUES (p_product_id, p_percent, p_start_date, p_end_date)
    ON CONFLICT (product_id) 
    DO UPDATE SET 
        percent = EXCLUDED.percent,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (NULL, 'Установлена скидка на товар: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура изменения цены товара
CREATE OR REPLACE PROCEDURE update_product_price(
    p_product_id UUID,
    p_new_price DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE product 
    SET price = p_new_price 
    WHERE id = p_product_id;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (NULL, 'Изменена цена товара: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;
