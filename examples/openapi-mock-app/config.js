module.exports = {
    name: "openapi-example",
    apis: [
        {
            baseurl: "/api1",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token",
            specification_file: 'swagger.yaml',
            name: "courses"
        }
    ],
    request_log_path: 'requests.log',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    port: 10000
}