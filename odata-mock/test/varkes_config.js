module.exports = {
    name: "Varkes OData-Mock",
    apis: [
        {
            name: "courses",
            specification_file: "test/courses.xml",
            type: "odata"
        }
    ],
    storage_file_path: "test/data.json",

}