module.exports = {
    specification_file: 'swagger.yaml',
    request_log_path: 'requests.log',
    added_endpoints: [
        {
            filePath: "OAuth_template.yaml",
            url: '/authorizationserver/oauth/token'
        }
    ],
    customResponsePath: '../../custom_responses',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    port: 3000
}