CREATE OR REPLACE FUNCTION update_product_quantity_after_supply()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO product_supplier (product_id, supplier_id, quantity)
    VALUES (
        NEW.product_id, 
        (SELECT supplier_id FROM supply WHERE id = NEW.supply_id),
        NEW.quantity_for_delivery
    )
    ON CONFLICT (product_id, supplier_id) 
    DO UPDATE SET 
        quantity = product_supplier.quantity + NEW.quantity_for_delivery,
        created_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_quantity
    AFTER INSERT ON supply_item
    FOR EACH ROW
    EXECUTE FUNCTION update_product_quantity_after_supply();
