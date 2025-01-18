# SurvEfrei

## Description

This project was done within the scope of the Advanced Programming module of I3 (Master 2) at EFREI Paris. It is a simple school management app written in NestJS for the backend and React for the frontend.

## Setup

### Prerequisites

1. A running MySQL server (or PostgreSQL server) with a database dedicated to the project
2. NodeJS installed
3. NestJS installed. To install it you can run the following commands:
`$ npm i -g @nestjs/cli`
4. PM2 installed. To install it you can run the following commands:
`$ sudo npm i -g pm2`


### Setup the back-end
Follow these steps to setup the back-end:

#### Setup the project

```
$ cd backend
$ npm install
```

#### Setup the environment variables
Then, you'll have to copy .env.example and paste it into a new file called .env
After that, you'll have to filled the different variables in the new file

```
NODE_ENV=Could be "production" or "dev"

SERVICE_MAIL=your mail service provider (ex: "gmail", "outlook"...)
PASS_MAIL=the password generated to allow this app to use the mail service
USER_MAIL=your email address

FRONT_END_BASIS_URL=The URL of the front end

DB_USER=the username of the database
DB_PASSWORD=the password of the database
DB_NAME=the name of the database
DB_PORT=the port of the database

SALT_AUTH_JWT=a generated and salted token

SALT_AUTH_ARGON2=a generated and salted token

SSL_KEY_PATH=the path to the SSL certificate key (if HTTPS is enabled)
SSL_CERT_PATH=the path to the SSL certificate (if HTTPS is enabled)

HTTP_SERVER_PORT=An available port number
ORGANIZATION_MICROSERVICE_PORT=An available port number
AUTH_MICROSERVICE_PORT=An available port number
SURVEY_MICROSERVICE_PORT=An available port number
USER_MICROSERVICE_PORT=An available port number
USER_ANSWERS_MICROSERVICE_PORT=An available port number
```

#### Run the application
Then, you'll have to run the following command to start the application:
```
$ npm run deploy
```


### Setup the front-end

Follow these steps to setup the front-end:

#### Set up the project
```
$ cd frontend
$ npm install
```

#### Set up the environment variables
Then, you'll have to copy .env.example and paste it into a new file called .env
After that, you'll have to filled the different variables in the new file
```
VITE_API_URL=An available port number
```

#### Run the frontend
Then, you'll have to run the following command to start the application:
```
$ npm run dev
```

## Creation of the first administrator

In order to use the application, you'll need to create the first administrator.
To do it, you can run the following CURL command:
```
curl --location 'http://localhost:HTTP_SERVER_PORT/user/register-first-admin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "your_email",
    "password": "your_password",
    "firstName": "your_first_name",
    "lastName": "your_last_name",
    "role": "admin"
}'
```