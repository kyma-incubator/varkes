"use strict";

var LOGGER = require("./logger").logger
const fs = require("fs");

Object.defineProperty(exports, "__esModule", { value: true });
const { parse, convert } = require('odata2openapi');
var jsonTemplate = {};
var jsTemplate = "";
var modelConfigTemplate
var model_config = {}
module.exports =
	{
		init: function () {
			jsonTemplate = JSON.parse(fs.readFileSync(__dirname + "/resources/modelTemplate.json", "utf8"));
			jsTemplate = fs.readFileSync(__dirname + "/resources/jsModel.txt", "utf8");
			modelConfigTemplate = JSON.parse(fs.readFileSync(__dirname + "/resources/modelConfigTemplate.json", "utf8"));
		},
		parseEdmx: function (path) {
			return new Promise(function (resolve, reject) {
				fs.readFile(path, "utf8", function (err, data) {
					if (err) reject(err);

					parse(data)
						.then(service => {
							createEntities(service);
							resolve(jsonTemplate);
						})
				});
			}).catch((error) => {
				LOGGER.error("Error while initializing API '%s': %s", path, error)
			});
		}
	};

function createEntities(service) {
	service.entityTypes.forEach(function (entityType) {
		var entityName = entityType.name;
		model_config[entityName] = modelConfigTemplate;
		fs.writeFileSync(__dirname + '/../generated/model-config.json', JSON.stringify(model_config));
		jsonTemplate.name = entityName;
		jsonTemplate.plural = entityName + "s";
		jsonTemplate = createEntityProperties(entityType, jsonTemplate);
		if (!fs.existsSync(__dirname + "/../generated/models"))
			fs.mkdirSync(__dirname + "/../generated/models")
		fs.writeFileSync(__dirname + "/../generated/models/" + entityName + ".json", JSON.stringify(jsonTemplate));
		fs.writeFileSync(__dirname + "/../generated/models/" + entityName + ".js", jsTemplate.replace('placeHolder', entityName));
	});
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