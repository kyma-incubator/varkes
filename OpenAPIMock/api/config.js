module.exports = {
    specification_file: 'api/swagger/swagger.yaml',
    request_log_path: 'requests.log',
    OAuth_template_path: 'api/swagger/OAuth_template.yaml',
    error_messages: {
        500: '{error:\"Something went Wrong\"}',
        400: '{error:\"Errorrrr\"}',
        404: '{error:\"End Point not found\"}'
    }
}