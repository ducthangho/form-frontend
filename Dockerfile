# syntax=docker/dockerfile:1.2
FROM node:15.8.0-alpine3.12 as development
ENV CI=true
ENV PORT=3000

#USER node
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY --chown=node:node package*.json /app/
#RUN chmod a+rw /app/package.json && chmod a+rw /app/package-lock.json && ls -l /app/ 
RUN  --mount=type=cache,target=/usr/local/lib/node_modules npm i -g npm-check-updates && npm install -g npm@7.5.4 && ncu -u
#RUN rm -rf node_modules package-lock.json
RUN --mount=type=cache,target=/app/.npm npm set cache /app/.npm && npm ci --only=production --legacy-peer-deps && npm i react-scripts

# add app
COPY . /app/

# start app
#EXPOSE 3000
#CMD ["npm", "start"]

FROM development as builder
RUN npm run build && npm prune --production


FROM nginx:1.19.6-alpine

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

COPY --from=builder /app/build/ /usr/share/nginx/html/
RUN ls -l /usr/share/nginx/html/
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]