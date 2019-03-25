import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as express from 'express';
var app = express();
if (environment.production) {
  enableProdMode();
}
function init(varkesConfigPath: string, currentPath = "") {
  app.use('/', AppModule);
  return app;
}