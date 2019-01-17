module.exports = {
    name: "OpenAPI-Mock",
    apis: [
        {
            baseurl: "/api1",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token",
            specification_file: 'apis/courses.yaml',
            name: "courses"
        }
    ],
    request_log_path: 'requests.log',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    }
}