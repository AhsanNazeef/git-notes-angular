import { bootstrapApplication } from '@angular/platform-browser';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
