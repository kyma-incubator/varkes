"use strict";

var LOGGER = require("./logger").logger
const fs = require("fs");

Object.defineProperty(exports, "__esModule", { value: true });
const { parse, convert } = require('odata2openapi');

module.exports =
{
	parseEdmx: function (path) {
		return new Promise(function (resolve, reject) {
			fs.readFile(path, "utf8", function (err, data) {
				if (err) reject(err);

				parse(data)
					.then(service => {
						var result = createEntities(service);
						resolve(result);
					}).catch(error=>{
						LOGGER.error("Error while parsing API '%s'", path)
						reject(error)
					})
			});
		})
	}
};

function createEntities(service) {
	var result = {
		modelConfigs: [],
		modelDefs: []
	}

	service.entityTypes.forEach(function (entityType) {
		var jsonTemplate = JSON.parse(fs.readFileSync(__dirname + "/resources/modelTemplate.json", "utf8"));
		var entityName = entityType.name;

		result.modelConfigs.push({ name: entityName, value:{dataSource: "db", public: true }})

		jsonTemplate.definition.name = entityName;
		jsonTemplate.definition.plural = entityName + "s";
		jsonTemplate.definition = createEntityProperties(entityType, jsonTemplate.definition);
		result.modelDefs.push(jsonTemplate)
	});

	return result
}

function createEntityProperties(entityType, template) {
	template.properties = {}
	entityType.properties.forEach(function (property) {

		template.properties[property.name] = {}
		if (property.required) {
			template.properties[property.name]["required"] = true;
		}
		template.properties[property.name]["type"] = property.type.replace("Edm.", "").toLowerCase();
	});
	return template;
}

exports.default = parse;