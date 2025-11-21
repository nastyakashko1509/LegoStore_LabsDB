-- Процедура обновления количества товара в корзине
CREATE OR REPLACE PROCEDURE update_cart_item_quantity(
    p_client_id UUID,
    p_product_id UUID,
    p_new_quantity INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
BEGIN
    -- Проверяем валидность количества
    IF p_new_quantity <= 0 THEN
        RAISE EXCEPTION 'Количество должно быть больше 0';
    END IF;

    -- Получаем ID корзины
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    -- Обновляем количество
    UPDATE cart_item 
    SET quantity = p_new_quantity, 
        added_at = CURRENT_TIMESTAMP
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    -- Проверяем, была ли обновлена хотя бы одна строка
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Товар не найден в корзине';
    END IF;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Обновлено количество товара в корзине: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура удаления товара из корзины
CREATE OR REPLACE PROCEDURE remove_from_cart(
    p_client_id UUID,
    p_product_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
BEGIN
    -- Получаем ID корзины
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    -- Удаляем товар из корзины
    DELETE FROM cart_item 
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    -- Проверяем, была ли удалена хотя бы одна строка
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Товар не найден в корзине';
    END IF;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Удален товар из корзины: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура очистки всей корзины
CREATE OR REPLACE PROCEDURE clear_cart(
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
    v_deleted_count INT;
BEGIN
    -- Получаем ID корзины
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    -- Удаляем все товары из корзины
    DELETE FROM cart_item WHERE cart_id = v_cart_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Очищена корзина, удалено товаров: ' || v_deleted_count, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Функция получения общей стоимости корзины
CREATE OR REPLACE FUNCTION get_cart_total(
    p_client_id UUID
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(
        ci.quantity * COALESCE(
            (SELECT p.price * (1 - dp.percent/100)
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dp.end_date >= CURRENT_DATE
             LIMIT 1),
            p.price
        )
    ), 0)
    INTO v_total
    FROM cart_item ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN product p ON ci.product_id = p.id
    WHERE c.client_id = p_client_id;
    
    RETURN v_total;
END;
$$;

-- Функция проверки доступности товаров в корзине
CREATE OR REPLACE FUNCTION check_cart_availability(
    p_client_id UUID
)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR(150),
    requested_quantity INT,
    available_quantity INT,
    is_available BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        ci.quantity as requested_quantity,
        COALESCE(SUM(ps.quantity), 0) as available_quantity,
        COALESCE(SUM(ps.quantity), 0) >= ci.quantity as is_available
    FROM cart_item ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN product p ON ci.product_id = p.id
    LEFT JOIN product_supplier ps ON p.id = ps.product_id
    WHERE c.client_id = p_client_id
    GROUP BY p.id, p.name, ci.quantity;
END;
$$;

-- Процедура применения скидки к корзине (если есть активные скидки на категории)
CREATE OR REPLACE PROCEDURE apply_category_discounts_to_cart(
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    cart_item_record RECORD;
    category_discount_record RECORD;
BEGIN
    -- Для каждого товара в корзине проверяем скидки на категорию
    FOR cart_item_record IN 
        SELECT ci.product_id, p.category_id
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        JOIN product p ON ci.product_id = p.id
        WHERE c.client_id = p_client_id
    LOOP
        -- Ищем активные скидки на категорию
        SELECT * INTO category_discount_record
        FROM discount_category 
        WHERE category_id = cart_item_record.category_id
        AND start_date <= CURRENT_DATE 
        AND end_date >= CURRENT_DATE
        LIMIT 1;
        
        -- Если нашли скидку на категорию и нет скидки на конкретный товар
        IF FOUND AND NOT EXISTS (
            SELECT 1 FROM discount_product 
            WHERE product_id = cart_item_record.product_id
            AND start_date <= CURRENT_DATE 
            AND end_date >= CURRENT_DATE
        ) THEN
            -- Логируем применение скидки
            INSERT INTO user_log (user_id, action, created_at)
            VALUES (p_client_id, 'Применена скидка категории к товару: ' || cart_item_record.product_id, CURRENT_TIMESTAMP);
        END IF;
    END LOOP;
    
    COMMIT;
END;
$$;

-- Функция получения детальной информации о корзине
CREATE OR REPLACE FUNCTION get_cart_details(
    p_client_id UUID
)
RETURNS TABLE(
    cart_item_id UUID,
    product_id UUID,
    product_name VARCHAR(150),
    brand_name VARCHAR(100),
    category_name VARCHAR(100),
    quantity INT,
    unit_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    final_unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    age_limit INT,
    added_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id as cart_item_id,
        p.id as product_id,
        p.name as product_name,
        b.name as brand_name,
        cat.name as category_name,
        ci.quantity,
        p.price as unit_price,
        COALESCE(
            (SELECT dp.percent
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dp.end_date >= CURRENT_DATE
             LIMIT 1),
            (SELECT dc.percent
             FROM discount_category dc
             WHERE dc.category_id = p.category_id
             AND dc.start_date <= CURRENT_DATE 
             AND dc.end_date >= CURRENT_DATE
             LIMIT 1),
            0
        ) as discount_percent,
        COALESCE(
            (SELECT p.price * (1 - dp.percent/100)
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dp.end_date >= CURRENT_DATE
             LIMIT 1),
            (SELECT p.price * (1 - dc.percent/100)
             FROM discount_category dc
             WHERE dc.category_id = p.category_id
             AND dc.start_date <= CURRENT_DATE 
             AND dc.end_date >= CURRENT_DATE
             LIMIT 1),
            p.price
        ) as final_unit_price,
        ci.quantity * COALESCE(
            (SELECT p.price * (1 - dp.percent/100)
             FROM discount_product dp
             WHERE dp.product_id = p.id 
             AND dp.start_date <= CURRENT_DATE 
             AND dc.end_date >= CURRENT_DATE
             LIMIT 1),
            (SELECT p.price * (1 - dc.percent/100)
             FROM discount_category dc
             WHERE dc.category_id = p.category_id
             AND dc.start_date <= CURRENT_DATE 
             AND dc.end_date >= CURRENT_DATE
             LIMIT 1),
            p.price
        ) as total_price,
        p.age_limit,
        ci.added_at
    FROM cart_item ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN product p ON ci.product_id = p.id
    JOIN brand b ON p.brand_id = b.id
    JOIN category cat ON p.category_id = cat.id
    WHERE c.client_id = p_client_id
    ORDER BY ci.added_at DESC;
END;
$$;
