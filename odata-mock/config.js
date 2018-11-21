module.exports = {
    specification_files: [
        { file: "EDMX_MODEL_SPECIFICATION.xml" }
    ],
    storage_file_path: "C:\\Users\\D074188\\Desktop\\varkes\\data.json",
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        401: '{"error":\"401 Entity does not exist\"}',
        404: '{"error":\"404 Bad URL\"}'
    },
    port: 3000
}