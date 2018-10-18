module.exports = {
    specification_file: '../swagger.yaml',
    request_log_path: 'requests.log',
    OAuth_template_path: '../OAuth_template.yaml',
    customResponsePath: '../../../custom_responses',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    }
}