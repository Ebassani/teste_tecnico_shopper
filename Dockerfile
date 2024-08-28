FROM node:18

RUN mkdir -p /teste_tecnico_shopper/node_modules && chown -R node:node /teste_tecnico_shopper

WORKDIR /teste_tecnico_shopper

COPY package*.json ./

RUN chown -R node:node /teste_tecnico_shopper

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "start" ]