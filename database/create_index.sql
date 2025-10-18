CREATE INDEX idx_product_category_id ON product(category_id);
CREATE INDEX idx_product_brand_id ON product(brand_id);
CREATE INDEX idx_product_price ON product(price);

CREATE INDEX idx_order_client_id ON "order"(client_id);
CREATE INDEX idx_order_status_id ON "order"(status_id);
CREATE INDEX idx_order_date ON "order"(order_date);

CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_product_id ON order_item(product_id);

CREATE INDEX idx_cart_item_cart_id ON cart_item(cart_id);
CREATE INDEX idx_cart_item_product_id ON cart_item(product_id);

CREATE INDEX idx_review_product_id ON review(product_id);
CREATE INDEX idx_review_rating ON review(rating);
CREATE INDEX idx_review_created_at ON review(created_at);

CREATE INDEX idx_user_log_user_id ON user_log(user_id);
CREATE INDEX idx_user_log_created_at ON user_log(created_at);

CREATE INDEX idx_discount_product_dates ON discount_product(start_date, end_date);
CREATE INDEX idx_discount_category_dates ON discount_category(start_date, end_date);

CREATE INDEX idx_supply_supplier_id ON supply(supplier_id);
CREATE INDEX idx_supply_status_id ON supply(status_id);
CREATE INDEX idx_supply_date ON supply(supply_date);

CREATE INDEX idx_supply_item_supply_id ON supply_item(supply_id);
CREATE INDEX idx_supply_item_product_id ON supply_item(product_id);

CREATE INDEX idx_user_role_id ON "user"(role_id);
CREATE INDEX idx_user_email ON "user"(email);
