CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password IS NOT NULL AND LENGTH(NEW.password) < 60 THEN
        NEW.password = CONCAT('hashed_', MD5(NEW.password));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hash_password
    BEFORE INSERT OR UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION hash_password();

CREATE OR REPLACE FUNCTION log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.password != NEW.password THEN
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (NEW.id, 'Пользователь изменил пароль', CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_password_change
    AFTER UPDATE OF password ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION log_password_change();
