"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const { parse, convert } = require('odata2openapi');
var jsonTemplate={};
var jsTemplate ="";
var modelConfigTemplate = {dataSource:"db",public:true}
var model_config = {}
module.exports = 
{
	parser:function()
	{
		console.log("entered parser")
		 fs.readFile("./common/models/modelTemplate.json", "utf8", function (err, data) {
	    	if (err) throw err;
			jsonTemplate = JSON.parse(data);
		})
		 fs.readFile("./common/models/jsModel.txt", "utf8", function (err, data) {
	    	if (err) throw err;
			jsTemplate = data;
		})
		 fs.readFile("./server/model-config.json", "utf8", function (err, data) {
	    	if (err) throw err;
			model_config = JSON.parse(data);
		})
	},
	parseEdmx:function(path)
	{
		console.log("entered parseEdmx")
		return new Promise(function(resolve, reject) {
		 fs.readFile(path, "utf8", function (err, data) {
	    	if (err) throw err;

			parse(data)
			  .then(service => {
			  console.log("entered function") 
			  	createEntities(service);
			  	
			    	resolve(jsonTemplate);
			    })
			  	
			  });
		 
		  
		}); 

	}
};

function createEntities(service)
{
	service.entityTypes.forEach(function(entityType)
	{
		var entityName = entityType.name;
		model_config[entityName] = modelConfigTemplate;
		fs.writeFileSync("./server/model-config.json", JSON.stringify(model_config));
		jsonTemplate.name = entityName;
		jsonTemplate.plural = entityName+"s";
		jsonTemplate = createEntityProperties(entityType,jsonTemplate);
		fs.writeFileSync("./common/models/"+entityName+".json", JSON.stringify(jsonTemplate)); 
		fs.writeFileSync("./common/models/"+entityName+".js", jsTemplate.replace('placeHolder',entityName));
	});
}

function createEntityProperties(entityType,template)
{	
	console.log(entityType.name)
	template.properties = {}
	entityType.properties.forEach(function(property){
		
		template.properties[property.name] = {}
		if(property.required)
		{
			template.properties[property.name]["required"] = true;
		}
		template.properties[property.name]["type"] = property.type.replace("Edm.","").toLowerCase();
		console.log("property");
		console.log(property);
	});
	return template;
}

exports.default = parse;