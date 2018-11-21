module.exports = {
    name: "commerce-mock",
    apis: [
        {
            baseurl: "/rest/v2",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token"
        },
        {
            baseurl: "/warehousingwebservices",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token"
        },
        {
            baseurl: "/ordermanagementwebservices",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token"
        },
        {
            baseurl: "/assistedservicewebservices",
            metadata: "/metadata",
            oauth: "/authorizationserver/oauth/token"
        }
    ]
}