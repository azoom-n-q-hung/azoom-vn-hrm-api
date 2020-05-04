FROM node:10-alpine
RUN apk add --update --no-cache tzdata && \
   cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
   echo 'Asia/Tokyo' > /etc/timezone && \
   apk del tzdata
WORKDIR /azoom-vn-hrm-api
COPY ["package.json", "yarn.lock", "./"]
RUN yarn
COPY . .
RUN yarn build:app
RUN yarn specs:build
ENTRYPOINT ["yarn", "start"]
