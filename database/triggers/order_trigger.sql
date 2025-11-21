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

--DROP TRIGGER IF EXISTS trigger_calculate_order_total ON order_item;
CREATE TRIGGER trigger_calculate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE OR REPLACE FUNCTION clear_cart_after_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_id = (SELECT id FROM order_status WHERE name = 'pending') THEN --pending - оформлен
        DELETE FROM cart_item 
        WHERE cart_id = (SELECT id FROM cart WHERE client_id = NEW.client_id);
        
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (NEW.client_id, 'Корзина очищена после оформления заказа', CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clear_cart_after_order
    AFTER INSERT ON "order"
    FOR EACH ROW
    EXECUTE FUNCTION clear_cart_after_order();
