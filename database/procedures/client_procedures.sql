-- Процедура добавления товара в корзину
CREATE OR REPLACE PROCEDURE add_to_cart(
    p_client_id UUID,
    p_product_id UUID,
    p_quantity INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
    v_current_price DECIMAL(10,2);
    v_age_limit INT;
    v_client_age INT;
BEGIN
    -- Проверяем возрастное ограничение
    SELECT age_limit INTO v_age_limit FROM product WHERE id = p_product_id;
    SELECT EXTRACT(YEAR FROM AGE(birthday)) INTO v_client_age FROM client WHERE id = p_client_id;
    
    IF v_client_age < v_age_limit THEN
        RAISE EXCEPTION 'Возрастное ограничение: %+ лет', v_age_limit;
    END IF;
    
    -- Получаем ID корзины
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    -- Получаем текущую цену с учетом скидок
    SELECT COALESCE(
        (SELECT price * (1 - percent/100) 
         FROM discount_product 
         WHERE product_id = p_product_id 
         AND start_date <= CURRENT_DATE 
         AND end_date >= CURRENT_DATE
         LIMIT 1),
        price
    ) INTO v_current_price FROM product WHERE id = p_product_id;
    
    -- Добавляем или обновляем товар в корзине
    INSERT INTO cart_item (cart_id, product_id, quantity, added_at)
    VALUES (v_cart_id, p_product_id, p_quantity, CURRENT_TIMESTAMP)
    ON CONFLICT (cart_id, product_id) 
    DO UPDATE SET 
        quantity = cart_item.quantity + p_quantity,
        added_at = CURRENT_TIMESTAMP;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Добавлен товар в корзину: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура оформления заказа
CREATE OR REPLACE PROCEDURE create_order(
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
    v_cart_id UUID;
    v_delivery_date TIMESTAMP;
    v_status_id UUID;
    cart_item_record RECORD;
BEGIN
    -- Получаем ID корзины
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    -- Проверяем, что корзина не пуста
    IF NOT EXISTS (SELECT 1 FROM cart_item WHERE cart_id = v_cart_id) THEN
        RAISE EXCEPTION 'Корзина пуста';
    END IF;
    
    -- Получаем ID статуса "оформлен"
    SELECT id INTO v_status_id FROM order_status WHERE name = 'оформлен';
    
    -- Рассчитываем дату доставки (через 3 дня)
    v_delivery_date := CURRENT_TIMESTAMP + INTERVAL '3 days';
    
    -- Создаем заказ
    INSERT INTO "order" (client_id, delivery_date, status_id)
    VALUES (p_client_id, v_delivery_date, v_status_id)
    RETURNING id INTO v_order_id;
    
    -- Переносим товары из корзины в заказ
    FOR cart_item_record IN 
        SELECT ci.product_id, ci.quantity, 
               COALESCE(
                   (SELECT p.price * (1 - dp.percent/100)
                    FROM discount_product dp
                    WHERE dp.product_id = ci.product_id 
                    AND dp.start_date <= CURRENT_DATE 
                    AND dp.end_date >= CURRENT_DATE
                    LIMIT 1),
                   p.price
               ) as unit_price
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.id
        WHERE ci.cart_id = v_cart_id
    LOOP
        INSERT INTO order_item (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, cart_item_record.product_id, cart_item_record.quantity, cart_item_record.unit_price);
    END LOOP;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Оформлен заказ: ' || v_order_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура получения корзины с расчетом стоимости
CREATE OR REPLACE FUNCTION get_cart_with_totals(p_client_id UUID)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR(150),
    quantity INT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    age_limit INT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        ci.quantity,
        COALESCE(
            (SELECT p.price * (1 - dp.percent/100)
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dp.end_date >= CURRENT_DATE
             LIMIT 1),
            p.price
        ) as unit_price,
        ci.quantity * COALESCE(
            (SELECT p.price * (1 - dp.percent/100)
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dp.end_date >= CURRENT_DATE
             LIMIT 1),
            p.price
        ) as total_price,
        p.age_limit
    FROM cart_item ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN product p ON ci.product_id = p.id
    WHERE c.client_id = p_client_id;
END;
$$;
