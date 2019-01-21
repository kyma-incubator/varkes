module.exports = {
    name: "Combined OpenAPI-Mock",
    apis: [
        {
            baseurl: "/api2",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token",
            specification_file: 'apis/schools.yaml',
            name: "schools"
        },
        {
            baseurl: "/api1",
            name: "courses",
            metadata: "/metadata",
            specification_file: 'apis/courses.yaml',
            oauth: "/authorizationserver/oauth/token"
        }
    ],
    events: [
        {
            specification_file: "apis/events.json",
            name: "events",
            description: "All Events v1",
            labels: {
                "connected-app": "testApp"
            }
        }
    ]
}