# Use Node.js version 14.17.3 as the base image
FROM node:21-alpine3.18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the working directory
COPY . .

# Expose the port your app will run on
EXPOSE $PORT

# Command to run the application
CMD ["node", "index.js"]