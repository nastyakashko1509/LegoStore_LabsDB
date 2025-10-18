-------------------------
-- SELECT - чтение данных
-------------------------

-- Получить все товары
SELECT * FROM product;

-- Найти ограниченное кол-во записей товаров
SELECT * FROM product LIMIT 5

-- Найти ограниченное кол-во записей товаров, пропуская (offset) несколько записей
SELECT * FROM product LIMIT 3 OFFSET 3;

-- Найти уникальные товары по бренду
SELECT DISTINCT brand_id FROM product;

---------------------
-- WHERE - фильтрация
---------------------

-- Найти товары при помощи "=, >, <"
SELECT * FROM product WHERE category_id = '...';
SELECT * FROM product WHERE price > 30000;

-- Показать заказы пользователя
SELECT * FROM "order" WHERE client_id = '...';

-- Найти товары по нескольким категориям
SELECT * FROM product WHERE category_id IN ('','',...)

-- Найти товары по всем категориям, кроме указанных
SELECT * FROM product WHERE category_id NOT IN ('','',...)

-- Найти товары с несколькими условиями
SELECT * FROM product WHERE brand_id='...' AND category_id='...';
SELECT * FROM product WHERE category_id='...' OR category_id='...';

-- Найти товары по заданному диапазону некоторого поля 
SELECT * FROM product WHERE price BETWEEN 30000 AND 50000;

-- Найти товары по некоторой части текста поля (_ - один символ, % - много символов)
SELECT * FROM product WHERE name LIKE 'Lego%'; -- Текст начинается с "Lego"
SELECT * FROM product WHERE name LIKE '%Lego'; -- Текст заканчивается на "Lego"
SELECT * FROM product WHERE name LIKE '%Lego%'; -- Текст содержит "Lego" где-то в середине
SELECT * FROM product WHERE name LIKE 'Lego_'; -- Один символ неизвестен: "Lego1", "Lego2", ...
SELECT * FROM product WHERE name LIKE 'Le__'; -- Два символа неизвестны: "Le_ _"
SELECT * FROM product WHERE name LIKE 'A___'; -- Начинается с 'A', потом три любых символа
SELECT * FROM product WHERE name LIKE 'L_go%'; -- Название начинается с "L", потом один символ, потом "go"

SELECT * FROM product WHERE name ILIKE '%lego%'; -- Поиск без учёта регистра

------------------------
-- ORDER BY - сортировка
------------------------

-- Отсортировать товар по цене по убыванию (DESC), по возрастанию (ASC)
SELECT * FROM product ORDER BY price DESC;
SELECT * FROM product ORDER BY price ASC;

-- Отсортировать товар по нескольким полям
SELECT * FROM product ORDER BY category_id, price DESC;
SELECT * FROM product ORDER BY category_id, price ASC;

-- Сортировка с фильтрацией
SELECT * FROM product WHERE age_limit >= 12 ORDER BY price DESC LIMIT 10;

-----------------------------------------------
-- INSERT INTO - вставка новых данных в таблицу
-----------------------------------------------

-- Добавление нового клиента
INSERT INTO "user" (name, email, phone, password, role_id)
VALUES ('Sergey Pavlov', 'sergey@mail.ru', '+79117777777', 'hashed_password_6', '11111111-1111-1111-1111-111111111111');

---------------------------------------
-- UPDATE - обновление данных в таблице
---------------------------------------

UPDATE "user" SET email = 'sergeypavlov@gmail.com' WHERE id = 'eb6421b8-d0f4-429a-9063-b0972e9882ef'

-----------------------------------------------
-- DELETE - удаление некоторых строк из таблицы
-----------------------------------------------

DELETE FROM "user" WHERE id = 'eb6421b8-d0f4-429a-9063-b0972e9882ef'

--------------------
-- ВЛОЖЕННЫЕ ЗАПРОСЫ
--------------------

SELECT * FROM product
WHERE price > (SELECT AVG(price) FROM product);

SELECT * FROM "user"
WHERE id IN (SELECT client_id FROM "order");

SELECT * FROM "order"
WHERE id IN (
    SELECT order_id FROM order_item
    WHERE product_id IN (
        SELECT id FROM product WHERE category_id = '...'
    )
);
