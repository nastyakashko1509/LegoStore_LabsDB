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
    IF p_new_quantity <= 0 THEN
        RAISE EXCEPTION 'Количество должно быть больше 0';
    END IF;

    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    UPDATE cart_item 
    SET quantity = p_new_quantity, 
        added_at = CURRENT_TIMESTAMP
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Товар не найден в корзине';
    END IF;
    
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Обновлено количество товара в корзине: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

CREATE OR REPLACE PROCEDURE remove_from_cart(
    p_client_id UUID,
    p_product_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
BEGIN
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    DELETE FROM cart_item 
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Товар не найден в корзине';
    END IF;
    
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Удален товар из корзины: ' || p_product_id, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

CREATE OR REPLACE PROCEDURE clear_cart(
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id UUID;
    v_deleted_count INT;
BEGIN
    SELECT id INTO v_cart_id FROM cart WHERE client_id = p_client_id;
    
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина не найдена';
    END IF;
    
    DELETE FROM cart_item WHERE cart_id = v_cart_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_client_id, 'Очищена корзина, удалено товаров: ' || v_deleted_count, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

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
