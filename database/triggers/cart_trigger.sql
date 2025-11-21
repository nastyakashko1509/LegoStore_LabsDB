CREATE OR REPLACE FUNCTION create_cart_for_new_client()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cart (client_id, created_at, updated_at)
    VALUES (NEW.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (NEW.id, 'Создана новая корзина для клиента', CURRENT_TIMESTAMP);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_cart
    AFTER INSERT ON client
    FOR EACH ROW
    EXECUTE FUNCTION create_cart_for_new_client();

CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cart SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.cart_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_timestamp
    AFTER INSERT OR UPDATE OR DELETE ON cart_item
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_timestamp();
