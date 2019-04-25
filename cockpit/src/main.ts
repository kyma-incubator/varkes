import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as LuigiClient from '@kyma-project/luigi-client';
if (environment.production) {
  enableProdMode();
}

LuigiClient.addInitListener(initialContext => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
});
