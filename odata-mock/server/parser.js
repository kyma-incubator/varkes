"use strict";

var LOGGER = require("./logger").logger
const fs = require("fs");

Object.defineProperty(exports, "__esModule", { value: true });
const { parse, convert } = require('odata2openapi');
var jsonTemplate = {};
var jsTemplate = "";
var modelConfigTemplate = { dataSource: "db", public: true }
var model_config = {}
var model_config_path = __dirname + '/../../server/model-config.json';
module.exports =
	{
		init: function () {
			jsonTemplate = JSON.parse(fs.readFileSync("resources/modelTemplate.json", "utf8"));
			jsTemplate = fs.readFileSync("resources/jsModel.txt", "utf8");
			model_config = JSON.parse(fs.readFileSync(model_config_path, "utf8"));
		},
		parseEdmx: function (path) {
			return new Promise(function (resolve, reject) {
				fs.readFile(path, "utf8", function (err, data) {
					if (err) throw err;

					parse(data)
						.then(service => {
							createEntities(service);
							resolve(jsonTemplate);
						})
				});
			});
		}
	};

function createEntities(service) {
	service.entityTypes.forEach(function (entityType) {
		var entityName = entityType.name;
		model_config[entityName] = modelConfigTemplate;
		fs.writeFileSync(model_config_path, JSON.stringify(model_config));
		jsonTemplate.name = entityName;
		jsonTemplate.plural = entityName + "s";
		jsonTemplate = createEntityProperties(entityType, jsonTemplate);
		fs.writeFileSync(__dirname + "/../generated/models/" + entityName + ".json", JSON.stringify(jsonTemplate));
		fs.writeFileSync(__dirname + "/../models/" + entityName + ".js", jsTemplate.replace('placeHolder', entityName));
	});
}

function createEntityProperties(entityType, template) {
	console.log(entityType.name)
	template.properties = {}
	entityType.properties.forEach(function (property) {

		template.properties[property.name] = {}
		if (property.required) {
			template.properties[property.name]["required"] = true;
		}
		template.properties[property.name]["type"] = property.type.replace("Edm.", "").toLowerCase();
		console.log("property");
		console.log(property);
	});
	return template;
}

exports.default = init;