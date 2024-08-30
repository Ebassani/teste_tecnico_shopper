# How to run

The projects needs a Google GEMINI API key, which can be stored in a .env file on the root folder of the project. The file is exemplified below:
```.env
GEMINI_API_KEY=yourAPIKey
```
The project can then be built by running docker-compose on the root folder:
``` BASH
docker-compose up --build
```

# Default ports

The defaullt ports are set to:
- 8080 for the express application
- 3306 for mySQL database

# Database
Specifics of how the database is built can be seen on init.sql.

In there it can be seen that the SQL is initialized with some mock data:

| id  | customer_code |
| --- | ------------- |
| 1   | CUST001       |
| 2   | CUST002       |

| measure_uuid | user_id | measure_type | measure_value | measure_datetime    | image_url                                                      | has_confirmed |
| ------------ | ------- | ------------ | ------------- | ------------------- | -------------------------------------------------------------- | ------------- |
| 1            | 1       | WATER        | 98            | 2024-08-01 08:00:00 | [http://example.com/image1.jpg](http://example.com/image1.jpg) | TRUE          |
| 2            | 1       | GAS          | 72            | 2024-08-01 08:10:00 | [http://example.com/image2.jpg](http://example.com/image2.jpg) | FALSE         |
| 3            | 1       | GAS          | 120           | 2024-08-01 08:20:00 | [http://example.com/image3.jpg](http://example.com/image3.jpg) | TRUE          |
| 4            | 2       | WATER        | 99            | 2024-08-02 09:00:00 | [http://example.com/image4.jpg](http://example.com/image4.jpg) | FALSE         |
| 5            | 2       | GAS          | 70            | 2024-08-02 09:10:00 | [http://example.com/image5.jpg](http://example.com/image5.jpg) | TRUE          |
| 6            | 2       | WATER        | 110           | 2024-08-02 09:20:00 | [http://example.com/image6.jpg](http://example.com/image6.jpg) | TRUE          |
