module.exports = {
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    name: "openapi-mock",
    apis: [
        {
            baseurl: "/entity",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token",
            specification_file: 'schools.yaml',
            name: "schools",
            added_endpoints: [ //endpoints
                {
                    filePath: "Endpoint_template.yaml",
                    url: '/trial_endpoint'
                }
            ]
        },
        {
            baseurl: "/entity/v1",
            metadata: "/metadata",
            name: "courses",
            specification_file: 'courses.yaml',
            oauth: "/authorizationserver/oauth/token"
        }
    ]
}