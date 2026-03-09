# CRUD API with Database Connection (Java Spring Boot)

A complete RESTful CRUD API built with Java Spring Boot and Spring Data JPA, supporting multiple database backends (H2, PostgreSQL, MySQL).

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Database connection with Spring Data JPA
- ✅ Support for H2, PostgreSQL, and MySQL
- ✅ Input validation with Jakarta Validation
- ✅ Global exception handling
- ✅ CORS enabled
- ✅ Automatic database schema generation
- ✅ Lombok for reducing boilerplate code

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Database (PostgreSQL/MySQL) - optional (H2 is used by default)

## Installation

1. **Clone or navigate to the project directory**

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   Or run the JAR file:
   ```bash
   java -jar target/crud-api-1.0.0.jar
   ```

The API will be available at:
- **API**: http://localhost:8080
- **H2 Console** (if using H2): http://localhost:8080/h2-console

## Database Configuration

Edit `src/main/resources/application.properties` to configure your database.

### H2 Database (Default - for development/testing)
Already configured by default. No additional setup needed.
- URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)
- Console: http://localhost:8080/h2-console

### PostgreSQL
Uncomment the PostgreSQL section in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/crud_api
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### MySQL
Uncomment the MySQL section in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crud_api?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

## API Endpoints

### Health Check
```
GET /api/items/health
```

### Get all items
```
GET /api/items
```

### Get item by ID
```
GET /api/items/{id}
```

### Create new item
```
POST /api/items
Content-Type: application/json

{
  "name": "Item Name",
  "description": "Item description",
  "price": "29.99"
}
```

### Update item
```
PUT /api/items/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "price": "39.99"
}
```

### Delete item
```
DELETE /api/items/{id}
```

## Using with DataGrip

1. **For PostgreSQL:**
   - Open DataGrip
   - Click "+" → Data Source → PostgreSQL
   - Host: `localhost`
   - Port: `5432`
   - Database: `crud_api`
   - User: `postgres` (or your username)
   - Password: (voleak)
   - Click "Test Connection" then "OK"

2. **For MySQL:**
   - Open DataGrip
   - Click "+" → Data Source → MySQL
   - Host: `localhost`
   - Port: `3306`
   - Database: `crud_api`
   - User: `root` (or your username)
   - Password: (your password)
   - Click "Test Connection" then "OK"

3. **For H2:**
   - Open DataGrip
   - Click "+" → Data Source → H2
   - URL: `jdbc:h2:mem:testdb`
   - User: `sa`
   - Password: (leave empty)
   - Note: H2 in-memory database resets when application restarts

## Project Structure

```
.
├── src/
│   ├── main/
│   │   ├── java/com/example/crudapi/
│   │   │   ├── CrudApiApplication.java    # Main application class
│   │   │   ├── controller/
│   │   │   │   └── ItemController.java    # REST controller
│   │   │   ├── service/
│   │   │   │   └── ItemService.java       # Business logic
│   │   │   ├── repository/
│   │   │   │   └── ItemRepository.java    # Data access layer
│   │   │   ├── model/
│   │   │   │   └── Item.java              # Entity model
│   │   │   ├── dto/
│   │   │   │   └── ItemDTO.java           # Data transfer object
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java  # Exception handling
│   │   └── resources/
│   │       └── application.properties      # Configuration
│   └── test/                               # Test files
├── pom.xml                                 # Maven dependencies
└── README.md                               # This file
```

## Example Usage

### Create an item
```bash
curl -X POST "http://localhost:8080/api/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Laptop\",
    \"description\": \"High-performance laptop\",
    \"price\": \"999.99\"
  }"
```

### Get all items
```bash
curl -X GET "http://localhost:8080/api/items"
```

### Get item by ID
```bash
curl -X GET "http://localhost:8080/api/items/1"
```

### Update an item
```bash
curl -X PUT "http://localhost:8080/api/items/1" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Laptop\",
    \"price\": \"1099.99\"
  }"
```

### Delete an item
```bash
curl -X DELETE "http://localhost:8080/api/items/1"
```

## Technologies Used

- **Spring Boot 3.2.0** - Framework
- **Spring Data JPA** - Database abstraction
- **Hibernate** - ORM
- **Lombok** - Reducing boilerplate
- **Jakarta Validation** - Input validation
- **Maven** - Dependency management

## Development

### Running in Development Mode
The application includes Spring Boot DevTools for hot reloading:
```bash
mvn spring-boot:run
```

### Building for Production
```bash
mvn clean package
java -jar target/crud-api-1.0.0.jar
```

## License

MIT
