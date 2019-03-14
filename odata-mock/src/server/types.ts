
type eventType = {
    specification: string,
    name: string,
    description: string,
    labels: {}
}
type apiType = {
    baseurl: string,
    oauth: string,
    name: string,
    metadata: string,
    specification: string,
    type: string,
    added_enpoints: Array<{ filePath: string, url: string }>
}
type VarkesConfigType = {
    name: string,
    apis: apiType[],
    events: eventType[]
}

export { VarkesConfigType }