CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
    total DECIMAL(10,2);
    target_order_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_order_id := OLD.order_id;
    ELSE
        target_order_id := NEW.order_id;
    END IF;
    
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO total
    FROM order_item
    WHERE order_id = target_order_id;
    
    UPDATE "order" 
    SET total_amount = total 
    WHERE id = target_order_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_order_total ON order_item;
CREATE TRIGGER trigger_calculate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE OR REPLACE FUNCTION clear_cart_after_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Логику очистки корзины перенесли в процедуру create_order,
    -- чтобы сначала скопировать позиции в order_item, а потом чистить корзину.
    -- Здесь оставляем пустую заглушку.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clear_cart_after_order ON "order";
CREATE TRIGGER trigger_clear_cart_after_order
    AFTER INSERT ON "order"
    FOR EACH ROW
    EXECUTE FUNCTION clear_cart_after_order();
