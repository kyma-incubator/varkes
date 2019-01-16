module.exports = {
    name: "Varkes OData-Mock",
    apis: [
        {
            name: "courses",
            metadata: "/courses/metadata",
            specification_file: "apis/courses.xml"
        }
    ],
    storage_file_path: "data.json",

}