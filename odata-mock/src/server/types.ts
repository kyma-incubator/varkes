
type apiType = {
    name: string,
    metadata: string,
    specification: string,
    type: string
}
type VarkesConfigType = {
    name: string,
    apis: apiType[]
}

export { VarkesConfigType }