module.exports = {
    specification_file: 'C:\\Users\\D074188\\Desktop\\varkes\\examples\\openapi-mock-app\\swagger.yaml',
    request_log_path: 'requests.log',
    added_endpoints: [
        {
            filePath: "C:\\Users\\D074188\\Desktop\\varkes\\examples\\openapi-mock-app\\OAuth_template.yaml",
            url: '/authorizationserver/oauth/token'
        }
    ],
    customResponsePath: 'C:\\Users\\D074188\\Desktop\\varkes\\examples\\openapi-mock-app\\custom_responses.js',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    port: 10000
}