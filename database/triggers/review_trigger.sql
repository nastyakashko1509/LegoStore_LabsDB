CREATE OR REPLACE FUNCTION validate_review_purchase()
RETURNS TRIGGER AS $$
DECLARE
    has_purchased BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM order_item oi
        JOIN "order" o ON o.id = oi.order_id
        WHERE o.client_id = NEW.client_id 
        AND oi.product_id = NEW.product_id
        AND o.status_id IN (SELECT id FROM order_status WHERE name IN ('delivered', 'shipped'))
    ) INTO has_purchased;
    
    IF NOT has_purchased THEN
        RAISE EXCEPTION 'Клиент может оставлять отзывы только на купленные товары';
    END IF;
    
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (NEW.client_id, 'Добавлен отзыв на товар: ' || NEW.product_id, CURRENT_TIMESTAMP);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_review
    BEFORE INSERT ON review
    FOR EACH ROW
    EXECUTE FUNCTION validate_review_purchase();
