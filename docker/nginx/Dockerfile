FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy configs as template
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template

# Create script to substitute environment variables at runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-substitute-env.sh && \
    echo 'envsubst "\$SERVER_NAME" < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/40-substitute-env.sh && \
    chmod +x /docker-entrypoint.d/40-substitute-env.sh

RUN mkdir -p /var/www/staticfiles
RUN mkdir -p /var/www/mediafiles
RUN mkdir -p /var/www/frontend