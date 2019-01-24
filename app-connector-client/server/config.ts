interface varkesConfigInterface {
    name: string,
    apis: Array<any>,
    events: Array<any>
}



var CONFIG = {
    keyDir: "keys",
    assetDir: "server/assets",
    nodePort: "",
    localKyma: false,
    URLs: {
        metadataUrl: "",
        eventsUrl: "",
        certificatesUrl: ""
    },
    apiFile: "api.json",
    crtFile: "kyma.crt",
    keyFile: "app.key",
    csrFile: "test.csr",
    varkesConfig: <varkesConfigInterface>{
        name: "",
        apis: [],
        events: []
    },
};

export { CONFIG, varkesConfigInterface }