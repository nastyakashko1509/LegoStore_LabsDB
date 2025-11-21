-- Процедура регистрации пользователя
CREATE OR REPLACE PROCEDURE register_user(
    p_name VARCHAR(100),
    p_email VARCHAR(100),
    p_phone VARCHAR(20),
    p_password VARCHAR(255),
    p_role_name VARCHAR(50),
    p_birthday DATE DEFAULT NULL,
    p_passport_series VARCHAR(10) DEFAULT NULL,
    p_passport_number VARCHAR(20) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_id UUID;
    role_id UUID;
    user_role VARCHAR(50);
BEGIN
    -- Получаем ID роли
    SELECT id INTO role_id FROM role WHERE name = p_role_name;
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Роль % не найдена', p_role_name;
    END IF;
    
    -- Вставляем пользователя (триггер автоматически хеширует пароль)
    INSERT INTO "user" (name, email, phone, password, role_id)
    VALUES (p_name, p_email, p_phone, p_password, role_id)
    RETURNING id INTO user_id;
    
    -- Создаем запись в соответствующей таблице в зависимости от роли
    IF p_role_name = 'client' THEN
        IF p_birthday IS NULL THEN
            RAISE EXCEPTION 'Для клиента обязательна дата рождения';
        END IF;
        INSERT INTO client (id, birthday) VALUES (user_id, p_birthday);
    ELSIF p_role_name = 'employee' THEN
        INSERT INTO employee (id, passport_series, passport_number) 
        VALUES (user_id, p_passport_series, p_passport_number);
    ELSIF p_role_name = 'admin' THEN
        INSERT INTO admin (id, passport_series, passport_number) 
        VALUES (user_id, p_passport_series, p_passport_number);
    END IF;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (user_id, 'Пользователь зарегистрирован с ролью: ' || p_role_name, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура входа в систему
CREATE OR REPLACE FUNCTION login_user(
    p_email VARCHAR(100),
    p_password VARCHAR(255)
)
RETURNS TABLE(
    user_id UUID,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    role_name VARCHAR(50)
) 
LANGUAGE plpgsql
AS $$
DECLARE
    hashed_pwd VARCHAR(255);
BEGIN
    -- Хешируем введенный пароль для сравнения
    hashed_pwd = CONCAT('hashed_', MD5(p_password));
    
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        r.name as role_name
    FROM "user" u
    JOIN role r ON u.role_id = r.id
    WHERE u.email = p_email AND u.password = hashed_pwd;
    
    -- Логируем попытку входа
    IF FOUND THEN
        INSERT INTO user_log (user_id, action, created_at)
        VALUES ((SELECT id FROM "user" WHERE email = p_email), 'Успешный вход в систему', CURRENT_TIMESTAMP);
    ELSE
        INSERT INTO user_log (user_id, action, created_at)
        VALUES (NULL, 'Неудачная попытка входа для email: ' || p_email, CURRENT_TIMESTAMP);
    END IF;
END;
$$;
