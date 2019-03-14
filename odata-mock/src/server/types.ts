
type apiType = {
    name: string,
    metadata: string,
    specification: string,
    type: string
}
type VarkesConfigType = {
    name: string,
    apis: apiType[],
    events: any[] //Todo: define event type
}

export { VarkesConfigType }