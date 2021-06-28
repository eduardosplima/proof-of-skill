# proof-of-skill

### Setup project
```
npm i
docker-compose up -d
```

### Reflecting updates in package.json
```
docker-compose up --build -V -d
```

### Build and deploy
```
export APP_NAME=proof-of-skill
export APP_PORT=8080
export LOGGER_LEVEL=info
export TZ=America/Sao_Paulo

docker build --tag $APP_NAME:latest .

docker run \
  --name $APP_NAME \
  --env APP_NAME=$APP_NAME \
  --env LOGGER_LEVEL=$LOGGER_LEVEL \
  --env TZ=$TZ \
  --restart=unless-stopped \
  --publish $APP_PORT:3000 \
  --init \
  --detach \
  $APP_NAME:latest
```