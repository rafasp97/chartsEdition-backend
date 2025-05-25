import * as Handlebars from 'handlebars';

export function registerHelpers() {
  Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
  });
}