module.exports = {
    name: "Combined OData-Mock",
    apis: [
        {
            name: "courses",
            metadata: "/courses/metadata",
            specification_file: "apis/courses.xml"
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
    ],
    storage_file_path: "data.json",

}