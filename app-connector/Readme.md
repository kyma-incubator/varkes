# App Connector

## Running 
- **Prerequisite:** You should have `opensll` installed and in path
- navigate to this folder.
- `npm install` 
- `npm start`
- After first start, this repo will generate a private key for you and save it in keys folder. **Don't change the location of the keys folder.**
- Visit *localhost:3000* to open the UI and enter your TokenURL to the input field. 
- Once you give your tokenURL, the system won't ask you again for your TokenURL. If you want to start the whole process again, delete the *keys* folder and run `npm start` again.

## Docs
You can access OpenAPI doc of this project either from *localhost:3000/metadata* or from *swagger.yaml* file.
## Developing

If you have *kubeconfig* file of the kyma cluster, you can automatically acquire token without using the kyma console.

- Run the command `kubectl --kubeconfig=config-file -n=kyma-integration port-forward svc/connector-service-internal-api 8080:8080`
- While the above command is running, go inside the *test* directory and run `node get_token.js`. This will get a token for you and output it to console.

## Testing

You can run `npm test`, to test the project. The kubectl command mentioned in *developing* section should be running because testing uses a new token everytime.

## Building
- To build the docker image of the project, run `npm run build`. 

- To run it, `docker run -p 3000:3000 varkes/server`. 
- You can connect to running container with `docker exec -it <container_id> /bin/sh`

## Logs
- Server logs will be in the file `server.log`
- Test logs will be in the file `test.log`