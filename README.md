
## Prompt

Build a simple API server to handle user audio projects. Your server should provide
endpoints that allow a user to perform the following actions:
1.  POST raw audio data and store it.
    Eg: $ curl -X POST --data-binary @myfile.wav http://localhost/post
2.  GET a list of stored files, GET the content of stored files, and GET metadata of
    stored files, such as the duration of the audio. The GET endpoint(s) should
    accept a query parameter that allows the user to filter results. Results should be
    returned as JSON.
    Eg: $ curl http://localhost/download?name=myfile.wav
    Eg: $ curl http://localhost/list?maxduration=300
    Eg: $ curl http://localhost/info?name=myfile.wav

## Usage

### Database preparation

Start the database via dockercompose. We'll leave it running in the background
```
docker-compose up -d
```

One started, create the schema by applying what can loosely be called our "migrations". Ideaily we'd set up and use sqitch instead.

```
PGPASSWORD=postgres psql -h localhost -U postgres < ./db_migrations/up.sql
```

If we need to reset the db later, we can easily roll back the database using:

```
PGPASSWORD=postgres psql -h localhost -U postgres < ./db_migrations/down.sql
```



### Usage

Get an example audio file if you don't already have one. I've renamed this one to match the examples above

```
wget https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav
```

With the database already running, start the server in one terminal:

```
npm run build;
npm run start;
```

Then you can use the API exactly as described above:

```
curl -X POST --data-binary @taunt.wav http://localhost:3000/post
curl http://localhost:3000/list?maxduration=300
curl http://localhost:3000/download?name=taunt.wav --output downloaded-taunt.wav
md5 taunt.wav downloaded-taunt.wav
MD5 (taunt.wav) = bdff3faccd932c1ef35d3239e11738cb
MD5 (downloaded-taunt.wav) = bdff3faccd932c1ef35d3239e11738cb
```
