import { render } from 'react-dom';
import * as Sentry from '@sentry/react';
import App from './app';

/*
Sentry.init({
  dsn:
    'https://b1183a2fe86f4a8f951e9bb67341c07f@o7983.ingest.sentry.io/5407669', // api key
  environment: process.env.NODE_ENV // production or development
});
*/

// render whole app
render(<App />, document.getElementById('root'));
