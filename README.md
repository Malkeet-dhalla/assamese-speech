# With Docker 
1. Install docker and docker-compose
3. In backend dir, `cp .env.default .env`
4. In the .env file add your Openai api key after `OPENAI_API_KEY=`
5. From the project root directory, run `docker compose build`
6. `docker compose up`
3. Go to `localhost:3000`.

# Without Docker
## Backend

In the backend directory

### Setup

Run only once

`python3 -m venv .venv`

`source .venv/bin/activate`

`python3 pip install -r requirements.txt`

`cp .env.default .env`

In the .env file add your Openai api key after `OPENAI_API_KEY=`

### Run

Run this to activate your venv

`source .venv/bin/activate`

Leave this running in a shell. Make sure the program is not stopped.

`python3 -m flask run --host=0.0.0.0 --debug`


## Frontend

In the frontend directory

### Setup
Install nodejs and npm

Run only once

`npm install`

### Run

`npm start`

Open `localhost:3000` in your browser
