FROM nodered/node-red:3.1

USER root
COPY package.json /tmp/nodered-user-package.json
RUN cd /usr/src/node-red && npm install --no-audit --no-fund \
    node-red-dashboard@^3.6.5 \
    node-red-contrib-ui-led@^0.4.11

COPY entrypoint.sh /docker-entrypoint-custom.sh
RUN sed -i 's/\r$//' /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

RUN mkdir -p /data/flows && chown -R node-red:node-red /data
COPY flows/flows.json /data/flows/seed-flows.json
RUN chown node-red:node-red /data/flows/seed-flows.json

RUN mkdir -p /opt/nodered-settings
COPY settings.js /opt/nodered-settings/settings.js
RUN chown node-red:node-red /opt/nodered-settings/settings.js

USER node-red
ENTRYPOINT ["/docker-entrypoint-custom.sh"]
