module.exports = {
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    name: "openapi-mock",
    apis: [
        {
            baseurl: "/api1",
            specification_file: 'test/pets.yaml',
            name: "pets"
        },
        {
            baseurl: "/api2",
            metadata: "/metadata",
            name: "courses",
            specification_file: 'test/courses.yaml',
            oauth: "/authorizationserver/oauth/token",
            added_endpoints: [ //endpoints
                {
                    filePath: "test/Endpoint_template.yaml",
                    url: '/trial_endpoint'
                }
            ]
        }
    ]
}