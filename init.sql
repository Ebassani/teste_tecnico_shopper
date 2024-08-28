CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS measures (
    measure_uuid INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    measure_type VARCHAR(10),
    measure_datetime DATETIME,
    image_url VARCHAR(250),
    has_confirmed BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
