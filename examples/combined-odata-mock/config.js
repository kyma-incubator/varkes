module.exports = {
    port: 10000,
    request_log_path: 'requests.log',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    name: "combined-odata",
    apis: [
        {
            name: "marketing",
            metadata: "/marketing/metadata",
            specification_file: "EDMX_MODEL_SPECIFICATION.xml"
        }
    ],
    storage_file_path: "data.json"
}