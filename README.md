# Zachs Recent Record Shelf

This is a small project for displaying a digital record shelf of recent tracks listened to on Spotify

## Demo

If you don't want to run the project yourself, checkout the demo app

## Prerequisites

Before getting started, you'll want to make sure you have a Postgres DB for the app to connect to.
I recommend using Docker locally to spin up a container

```sh
docker run --name faura-th -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

Next, you'll need to create a [Spotify Developer account](https://developer.spotify.com/) and create a new app to get these keys. After you sign in, you can create an app [here](https://developer.spotify.com/dashboard/create)
Make sure to check the Web API for "Which API/SDLs are you planning to use?"

After setting up your DB and Spotify account, you'll want to setup a local `.env.local` file in the root directory with those values, here's an example:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/faura-th
SPOTIFY_CLIENT_ID=YOUR_CLIENT_ID_HERE
SPOTIFY_CLIENT_SECRET=YOUR_SECRET_HERE
SPOTIFY_REDIRECT_URI=http://localhost:3000/login/spotify/callback
SPOTIFY_FEATURED_USER=""
```

## Installation

First, start by installing the dependencies using `yarn`

```sh
yarn install
```

Then, you can run the app with the dev script

```sh
yarn dev
```

Open the link, sign in, and your shelf will display
