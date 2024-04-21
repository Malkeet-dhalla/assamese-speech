# Setup

## Backend

In backend directory

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

`python3 -m flask run --host=0.0.0.0`


## Frontend

In the frontend directory

### Setup
Install nodejs and npm

Run only once
`npm install`

### Run

`npm start`

Open `localhost:3000` in your browser
