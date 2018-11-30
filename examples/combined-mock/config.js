module.exports = {
    port: 10000,
    request_log_path: 'requests.log',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    name: "basic-re",
    apis: [
        {
            baseurl: "/entity",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token",
            specification_file: 'schools.yaml',
            added_endpoints: [
                {
                    filePath: "Endpoint_template.yaml",
                    url: '/trial_endpoint'
                }
            ]
        },
        {
            baseurl: "/entity/v1",
            metadata: "/metadata",
            specification_file: 'courses.yaml',
            oauth: "/authorizationserver/oauth/token"
        }
    ]
}