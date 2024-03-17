#docker push ragkit:0.0.1
#docker run -p 9000:9000 ragkit:0.0.1
#docker build -f ./docker/Dockerfile -t ragkit:0.0.1 .

#STEP 1
FROM node as builder
WORKDIR /code

## If bcrypt is needed
#RUN apk --no-cache add --virtual builds-deps build-base python

#Revisit this
COPY . /code/

#install packages
RUN npm ci

CMD [ "npm", "run", "start" ]
EXPOSE 9000