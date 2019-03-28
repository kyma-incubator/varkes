#!/usr/bin/env node
'use strict'

import { logger as LOGGER } from "./logger"
const fs = require("fs");
import {ParsedModels} from "./types"
Object.defineProperty(exports, "__esModule", { value: true });
const { parse } = require('odata2openapi');

function parseEdmx(path: string):Promise<ParsedModels> {
	return new Promise<ParsedModels>(function (resolve, reject) {
		fs.readFile(path, "utf8", function (err: Error, data: any) {
			if (err) reject(err);

			parse(data)
				.then((service: any) => {
					let result = createEntities(service);
					resolve(result);
				}).catch((error: Error) => {
					LOGGER.error("Error while parsing API '%s'", path)
					reject(error)
				})
		});
	})
}

function createEntities(service: any):ParsedModels{
	let result: ParsedModels = {
		modelConfigs: [],
		modelDefs: []
	}

	service.entityTypes.forEach((entityType: any) => {
		let jsonTemplate = JSON.parse(fs.readFileSync(__dirname + "/resources/model_template.json", "utf8"));
		let entityName = entityType.name;

		result.modelConfigs.push({ name: entityName, value: { dataSource: "db", public: true } })

		jsonTemplate.definition.name = entityName;
		jsonTemplate.definition.plural = entityName + "s";
		jsonTemplate.definition = createEntityProperties(entityType, jsonTemplate.definition);
		result.modelDefs.push(jsonTemplate)
	});

	return result
}

function createEntityProperties(entityType: any, template: any) {
	template.properties = {}
	entityType.properties.forEach(function (property: any) {

		template.properties[property.name] = {}
		if (property.required) {
			template.properties[property.name]["required"] = true;
		}
		template.properties[property.name]["type"] = mapType(property.type)
	});
	return template;
}

// https://loopback.io/doc/en/lb3/LoopBack-types.html
// https://openui5.hana.ondemand.com/1.36.0/docs/guide/333a9dac5a614b1590c61916c9cecbf5.html
function mapType(edmType: string): string | null {
	if (!edmType) {
		return null
	}
	switch (edmType) {
		case "Edm.Boolean":
			return "Boolean"
		case "Edm.Guid":
			return "String"
		case "Edm.DateTime":
			return "date"
		case "Edm.Decimal":
			return "number"
		case "Edm.Double":
			return "number"
		case "Edm.Int16":
			return "number"
		case "Edm.Int32":
			return "number"
		case "Edm.Int64":
			return "number"
		case "Edm.String":
			return "String"
		default:
			return "any";
	}
}

export { parseEdmx }


