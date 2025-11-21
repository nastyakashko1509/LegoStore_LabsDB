CREATE OR REPLACE PROCEDURE change_user_role(
    p_user_id UUID,
    p_new_role_name VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_role_id UUID;
    v_current_role_name VARCHAR(50);
BEGIN
    SELECT id INTO v_new_role_id FROM role WHERE name = p_new_role_name;
    
    -- Получаем текущую роль
    SELECT r.name INTO v_current_role_name 
    FROM "user" u 
    JOIN role r ON u.role_id = r.id 
    WHERE u.id = p_user_id;
    
    IF v_new_role_id IS NULL THEN
        RAISE EXCEPTION 'Роль % не найдена', p_new_role_name;
    END IF;
    
    UPDATE "user" SET role_id = v_new_role_id WHERE id = p_user_id;
    
    -- Удаляем старую роль 
    IF v_current_role_name = 'client' THEN
        DELETE FROM client WHERE id = p_user_id;
    ELSIF v_current_role_name = 'employee' THEN
        DELETE FROM employee WHERE id = p_user_id;
    ELSIF v_current_role_name = 'admin' THEN
        DELETE FROM admin WHERE id = p_user_id;
    END IF;
    
    -- Добавляем запись в соответствующую таблицу 
    IF p_new_role_name = 'client' THEN
        INSERT INTO client (id, birthday) VALUES (p_user_id, CURRENT_DATE - INTERVAL '18 years');
    ELSIF p_new_role_name = 'employee' THEN
        INSERT INTO employee (id) VALUES (p_user_id);
    ELSIF p_new_role_name = 'admin' THEN
        INSERT INTO admin (id) VALUES (p_user_id);
    END IF;
    
    -- Логируем действие
    INSERT INTO user_log (user_id, action, created_at)
    VALUES (p_user_id, 'Изменена роль пользователя на: ' || p_new_role_name, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- Процедура просмотра логов с фильтрацией
CREATE OR REPLACE FUNCTION get_user_logs(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL,
    p_action_filter VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE( -- Функция возвращает таблицу со столбцами
    log_id UUID,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    action_text VARCHAR(255),
    log_date TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY -- Вернуть результат следующего запроса
    SELECT 
        ul.id,
        u.name,
        u.email,
        ul.action,
        ul.created_at
    FROM user_log ul
    LEFT JOIN "user" u ON ul.user_id = u.id
    WHERE (p_user_id IS NULL OR ul.user_id = p_user_id)
    AND (p_start_date IS NULL OR ul.created_at >= p_start_date)
    AND (p_end_date IS NULL OR ul.created_at <= p_end_date)
    AND (p_action_filter IS NULL OR ul.action ILIKE '%' || p_action_filter || '%')
    ORDER BY ul.created_at DESC;
END;
$$;
