CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS measures (
    measure_uuid INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    measure_type VARCHAR(10),
    measure_value INT,
    measure_datetime DATETIME,
    image_url VARCHAR(250),
    has_confirmed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);



INSERT INTO users (customer_code) VALUES ('CUST001');
INSERT INTO users (customer_code) VALUES ('CUST002');


INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (1, 'WATER', 98, '2024-08-01 08:00:00', 'http://example.com/image1.jpg', TRUE);

INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (1, 'GAS', 72, '2024-08-01 08:10:00', 'http://example.com/image2.jpg', FALSE);

INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (1, 'GAS', 120, '2024-08-01 08:20:00', 'http://example.com/image3.jpg', TRUE);

-- Insert 3 measures for User 2 (CUST002)
INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (2, 'WATER', 99, '2024-08-02 09:00:00', 'http://example.com/image4.jpg', FALSE);

INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (2, 'GAS', 70, '2024-08-02 09:10:00', 'http://example.com/image5.jpg', TRUE);

INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, image_url, has_confirmed) 
VALUES (2, 'WATER', 110, '2024-08-02 09:20:00', 'http://example.com/image6.jpg', TRUE);
