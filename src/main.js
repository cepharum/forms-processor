// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import FormsProcessor from "./library";

FormsProcessor.runConfiguration( ( window || global || self ).CepharumForms || {} );
