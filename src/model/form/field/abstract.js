/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

import {Processor} from "simple-terms";

import EventBus from "@/service/events";
import L10n from "@/service/l10n";
import Data from "@/service/data";

const termCache = new Map();

/**
 * Declares default values of commonly supported field properties.
 *
 * @type {object<string,string>}
 */
const defaultProperties = {
	required: "false",
	visible: "true",
	type: "text",
};

/**
 * Matches definition of a binding occurring in a property's value.
 *
 * @type {RegExp}
 */
const ptnBinding = /({{[^}]+}})/;

/**
 * Lists reserved names of properties that mustn't be commonly processed
 * when used as a property name in field's definition.
 *
 * @type {string[]}
 */
const reserved = [
	"form",
	"index",
	"name",
	"originalName",
	"qualifiedName",
	"type",
	"value",
	"dependsOn",
	"dependents",
	"pristine",
	"valid",
	"errors",
];


/**
 * Implements abstract base class of managers handling certain type of field in
 * a form.
 */
export default class FormFieldAbstractModel {
	/**
	 * Indicates if current type of field is interactive thus providing any
	 * input data.
	 *
	 * @returns {boolean} true if fields of this type are generating input data
	 */
	static get isInteractive() {
		return false;
	}

	/**
	 * @param {FormModel} form manages form containing this field
	 * @param {object} definition properties and constraints of single form field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {PropertyDescriptorMap} properties defines custom properties to be
	 *        exposed instead of those derived from definition by default
	 */
	constructor(form, definition, fieldIndex, reactiveFieldInfo, properties = {}) {
		const {name} = definition;
		if (!name) {
			throw new TypeError(`missing field name in definition`);
		}


		/*
		 * --- expose essential properties of field ---------------------------
		 */

		const originalName = String(name).trim();
		const normalizedName = originalName.toLowerCase();
		const formName = form.name;
		const qualifiedName = `${formName}.${normalizedName}`;

		Object.defineProperties(this, {
			/**
			 * Provides reference on instance managing form containing field.
			 *
			 * @name FormFieldAbstractModel#form
			 * @property {FormModel}
			 * @readonly
			 */
			form: {value: form},

			/**
			 * Provides index of field in sequence of its containing form's
			 * fields.
			 *
			 * @name FormFieldAbstractModel#index
			 * @property {int}
			 * @readonly
			 */
			index: {value: parseInt(fieldIndex)},

			/**
			 * Provides defined name of field.
			 *
			 * @name FormFieldAbstractModel#name
			 * @property {string}
			 * @readonly
			 */
			name: {value: normalizedName},

			/**
			 * Provides original name of field which is the name used in field's
			 * definition.
			 *
			 * Any derived name in properties `name` and `qualifiedName` use all
			 * lower-case variant of this original name to relax addressing
			 * issues e.g. in processed terms. This original name is used to
			 * name HTML components as well as on processing data.
			 *
			 * @name FormFieldAbstractModel#originalName
			 * @property {string}
			 * @readonly
			 */
			originalName: {value: originalName},

			/**
			 * Provides qualified name of field consisting of its containing
			 * form's name and its own name.
			 *
			 * @name FormFieldAbstractModel#qualifiedName
			 * @property {string}
			 * @readonly
			 */
			qualifiedName: {value: qualifiedName},

			/**
			 * Reads current value of field.
			 *
			 * @name FormFieldAbstractModel#value
			 * @property {*|undefined} current value of field, `undefined` if there is no value available for current field
			 */
			value: this.constructor.isInteractive ? {
				get: () => form.readValue(qualifiedName),
				set: value => form.writeValue(qualifiedName, value),
			} : {value: undefined},
		});


		/*
		 * --- expose dynamic and custom properties of field ------------------
		 */

		/**
		 * Collects terms used in context of current field's definition.
		 *
		 * @type {Processor[]}
		 */
		const terms = [];

		/**
		 * Collects eventually exposed properties of field.
		 *
		 * @type {PropertyDescriptorMap}
		 */
		const getters = {};

		/**
		 * Qualifies caller-provided definition to always include some default
		 * elements.
		 *
		 * @type {object}
		 */
		const qualifiedDefinition = Object.assign({}, defaultProperties, definition);


		{
			const propNames = Object.keys(qualifiedDefinition);
			const numProps = propNames.length;

			for (let pni = 0; pni < numProps; pni++) {
				const propertyName = propNames[pni];
				let propertyValue = qualifiedDefinition[propertyName];

				switch (propertyName) {
					case "type" :
						// this property is essential, can't be computed and
						// requires certain type of value
						if (typeof propertyValue !== "string" || !propertyValue.trim().length) {
							throw new TypeError(`invalid type of field ${qualifiedName}`);
						}

						getters[propertyName] = {value: propertyValue};
						break;

					default :
						if (reserved.indexOf(propertyName) < 0) {
							// handle non-reserved properties of definition in a common way

							if (properties.hasOwnProperty(propertyName)) {
								// got some custom descriptor of property to expose
								const descriptor = properties[propertyName];
								if (descriptor) {
									properties[propertyName] = null;

									if (typeof descriptor === "function") {
										// descriptor depends on value of qualified definition's property
										getters[propertyName] = descriptor.call(this, propertyValue, propertyName, qualifiedDefinition);
									} else {
										getters[propertyName] = descriptor;
									}
								}
							} else {
								propertyValue = L10n.selectLocalized(propertyValue, form.locale);
								if (propertyValue != null) {
									propertyValue = String(propertyValue).trim();

									if (propertyValue.charAt(0) === "=") {
										const term = new Processor(propertyValue.slice(1), {}, termCache, resolveVariableName);
										terms.push(term);
										getters[propertyName] = {
											get: () => normalizeDefinitionValue(propertyName, term.evaluate(form.data)),
										};
									} else {
										const slices = propertyValue.split(ptnBinding);
										const numSlices = slices.length;
										let isDynamic = false;

										for (let i = 0; i < numSlices; i++) { // eslint-disable-line max-depth
											const slice = slices[i];
											const match = slice.match(ptnBinding);
											if (match) { // eslint-disable-line max-depth
												const term = new Processor(slice.slice(2, -2), {}, termCache, resolveVariableName);
												terms.push(term);
												slices[i] = term;
												isDynamic = true;
											}
										}

										if (isDynamic) { // eslint-disable-line max-depth
											getters[propertyName] = {
												get: () => {
													const rendered = new Array(numSlices);

													for (let i = 0; i < numSlices; i++) {
														const slice = slices[i];

														if (slice instanceof Processor) {
															rendered[i] = slice.evaluate(form.data);
														} else {
															rendered[i] = slice;
														}
													}

													const result = normalizeDefinitionValue(propertyName, rendered.join(""));

													reactiveFieldInfo[propertyName] = result;

													return result;
												}
											};
										} else {
											propertyValue = normalizeDefinitionValue(propertyName, propertyValue);

											getters[propertyName] = {value: propertyValue};
											reactiveFieldInfo[propertyName] = propertyValue;
										}
									}
								}
							}
						}
				}
			}
		}

		{ // make sure to transfer "default" behaviour of custom properties due to lacking definition mentioning it
			const propNames = Object.keys(properties);
			const numProps = propNames.length;

			for (let pni = 0; pni < numProps; pni++) {
				const propertyName = propNames[pni];
				const descriptor = properties[propertyName];

				if (reserved.indexOf(propertyName) < 0) {
					if (descriptor && !getters.hasOwnProperty(propertyName)) {
						if (typeof descriptor === "function") {
							// descriptor depends on value of qualified definition's property
							getters[propertyName] = descriptor.call(this, undefined, propertyName, qualifiedDefinition);
						} else {
							getters[propertyName] = descriptor;
						}
					}
				}
			}
		}

		Object.defineProperties(this, getters);


		/*
		 * --- expose dependencies and reactive data of field -----------------
		 */

		// collect combined dependencies of all terms processed before
		const collectedDependencies = {};
		for (let i = 0, numTerms = terms.length; i < numTerms; i++) {
			const dependencies = terms[i].dependsOn;

			for (let j = 0, numDependencies = dependencies.length; j < numDependencies; j++) {
				collectedDependencies[dependencies[j].join(".")] = true;
			}
		}


		/**
		 * Lists names of fields depending on current one.
		 *
		 * This list is to be fed by fields detecting themselves to depend on
		 * current one.
		 *
		 * @type {null|string[]}
		 */
		let dependents = null;

		/**
		 * Marks if this field's set of reactive properties for use with its
		 * component instances has been fully initialized or not.
		 *
		 * Initialization of some reactive properties is delayed until their
		 * first use due to relying on local methods requiring constructor to
		 * finish in turn.
		 *
		 * @type {boolean}
		 */
		let initializedReactiveInfo = false;

		/**
		 * Caches reference on component created to render current field.
		 *
		 * @type {?Component}
		 */
		let component = null;


		// qualify provided variable space to be reactive data of current field
		// in context of containing form's reactive data
		reactiveFieldInfo.required = null;
		reactiveFieldInfo.visible = null;
		reactiveFieldInfo.pristine = true;
		reactiveFieldInfo.valid = null;
		reactiveFieldInfo.value = null;
		reactiveFieldInfo.label = null;
		reactiveFieldInfo.hint = null;
		reactiveFieldInfo.errors = [];


		Object.defineProperties(this, {
			/**
			 * Lists paths of variables this field depends on due to terms used
			 * in field's definition.
			 *
			 * @name FormFieldAbstractModel#dependsOn
			 * @property {Array<string[]>}
			 * @readonly
			 */
			dependsOn: {value: Object.keys(collectedDependencies)},

			/**
			 * Lists names of fields depending on current one's value/state.
			 *
			 * @name FormFieldAbstractModel#dependents
			 * @property {string[]}
			 * @readonly
			 */
			dependents: {
				get: () => (dependents == null ? [] : dependents),
				set: dependingFieldNames => {
					if (Array.isArray(dependingFieldNames)) {
						if (dependents == null) {
							dependents = dependingFieldNames;
						}
					}
				},
			},

			/**
			 * Indicates if field is considered valid, currently.
			 *
			 * @note By assigning any value (which is ignored) any previously
			 *       validation result is dropped.
			 *
			 * @name FormFieldAbstractModel#valid
			 * @property {boolean}
			 * @readonly
			 */
			valid: {
				get: () => {
					if (reactiveFieldInfo.valid == null) {
						if (reactiveFieldInfo.pristine) {
							return true;
						}

						try {
							reactiveFieldInfo.errors = Data.unique(this.validate());
						} catch (e) {
							reactiveFieldInfo.errors = ["@VALIDATION.UNEXPECTED_ERROR"];
						}

						reactiveFieldInfo.valid = reactiveFieldInfo.errors.length === 0;
					}

					return reactiveFieldInfo.valid;
				},
			},

			/**
			 * Exposes information on current field being pristine or not.
			 *
			 * @note This information is basically read-only. It's possible to
			 *       write falsy value to explicitly mark field _touched_. This
			 *       is implicitly dropping cached information on field's
			 *       validity.
			 *
			 * @name FormFieldAbstractModel#pristine
			 * @property {boolean}
			 */
			pristine: {
				get: () => reactiveFieldInfo.pristine,
				set: value => {
					if (value) {
						throw new TypeError(`invalid request for marking field ${this.qualifiedName} as pristine`);
					}

					reactiveFieldInfo.pristine = false;
					reactiveFieldInfo.valid = null;
				},
			},

			/**
			 * Lists errors encountered during recent-most validation of field.
			 *
			 * @name FormFieldAbstractModel#errors
			 * @property {string[]}
			 * @readonly
			 */
			errors: {get: () => reactiveFieldInfo.errors},

			/**
			 * Exposes reactive data of current field as used by any component
			 * used to present this field.
			 *
			 * @name FormFieldAbstractModel#$data
			 * @property {object<string,*>}
			 * @readonly
			 */
			$data: {
				get: () => {
					if (!initializedReactiveInfo) {
						initializedReactiveInfo = true;

						form.writeValue(qualifiedName, this._initializeReactive(reactiveFieldInfo));
					}

					return reactiveFieldInfo;
				}
			},

			/**
			 * Provides description of component representing current field.
			 *
			 * @name FormFieldAbstractModel#component
			 * @property {Component}
			 * @readonly
			 */
			component: {
				get() {
					if (component == null) {
						if (!initializedReactiveInfo) {
							initializedReactiveInfo = true;

							form.writeValue(qualifiedName, this._initializeReactive(reactiveFieldInfo));
						}

						component = this._renderComponent(reactiveFieldInfo);
					}

					return component;
				}
			},
		});


		/**
		 * Resolves variable name found in terms used in definition converting
		 * local references into global ones using a field's qualified name.
		 *
		 * @param {string[]} originalPath segments of path addressing variable as given in term
		 * @returns {string[]} optionally qualified list of segments for addressing some variable globally
		 */
		function resolveVariableName(originalPath) {
			if (originalPath.length === 1) {
				return [form.name, originalPath[0]];
			}

			return originalPath;
		}
	}

	/**
	 * Initializes data in provided set of reactive data of field.
	 *
	 * @param {object} reactiveFieldInfo reactive variable space e.g. used by field's component
	 * @returns {*} initial value of field as used on initializing reactive data
	 * @private
	 */
	_initializeReactive(reactiveFieldInfo) {
		const initialValue = this.normalizeValue(this.initial);

		reactiveFieldInfo.required = this.required;
		reactiveFieldInfo.visible = this.visible;
		reactiveFieldInfo.label = this.label;
		reactiveFieldInfo.hint = this.hint;
		reactiveFieldInfo.value = initialValue;

		return initialValue;
	}

	/**
	 * Exposes service handling localization of internationalized values so
	 * custom field extensions might access is via this provided abstract base
	 * class.
	 *
	 * @param {string|object<string,string>} internationalizedValue non-internationalized string or object mapping locale tag into one of several translation
	 * @returns {string} localized string
	 */
	selectLocalization(internationalizedValue) {
		return L10n.selectLocalized(internationalizedValue, this.form.locale);
	}

	/**
	 * Handles change of a field's value by updating state of model accordingly.
	 *
	 * @param {*} store reference on store the adjustments took place in
	 * @param {*} newValue new value of field
	 * @param {?string} updatedFieldName name of updated field, null if current field was updated
	 * @returns {void}
	 */
	onUpdateValue(store, newValue, updatedFieldName = null) {
		const data = this.$data;
		const itsMe = updatedFieldName == null;

		this.updateFieldInformation(data);

		if (!itsMe && data.pristine) {
			// some other field has been updated
			// -> my initial value might depend on it, so
			//    re-assign my initial unless field has been
			//    adjusted before
			store.dispatch("form/writeInput", {
				name: this.qualifiedName,
				value: this.initial,
			});
		}

		// changing current field or some field current one
		// depends on might affect validity of current field
		if (!data.pristine) {
			data.valid = null;
			const valid = this.valid; // eslint-disable-line no-unused-vars
		}

		if (!itsMe) {
			EventBus.$emit("form:update", this.qualifiedName, updatedFieldName, newValue);
		}
	}

	/**
	 * Updates reactive information on current field probably re-evaluating
	 * terms used in definition of that information.
	 *
	 * @note Overload this method to extend list of properties to be
	 *       re-evaluated per type of field.
	 *
	 * @param {object} reactiveFieldInformation contains reactive properties of field
	 * @returns {void}
	 */
	updateFieldInformation(reactiveFieldInformation) {
		reactiveFieldInformation.label = this.label;
		reactiveFieldInformation.hint = this.hint;
		reactiveFieldInformation.required = this.required;
		reactiveFieldInformation.visible = this.visible;
	}

	/**
	 * Fetches description of a Vue component representing this field.
	 *
	 * @param {object} reactiveFieldInfo provides object containing reactive information on field
	 * @returns {object} description of Vue component
	 */
	_renderFieldComponent(reactiveFieldInfo) { // eslint-disable-line no-unused-vars
		return {
			render(createElement) {
				return createElement("<!-- abstract field -->");
			},
		};
	}

	/**
	 * Provides definition of field's component.
	 *
	 * @param {object} reactiveFieldInfo provides object containing reactive information on field
	 * @returns {object} provides definition of field's component
	 */
	_renderComponent(reactiveFieldInfo) {
		const that = this;
		const {type, originalName, name, qualifiedName, classes} = this;

		return {
			components: {
				FieldComponent: this._renderFieldComponent(reactiveFieldInfo),
			},
			computed: {
				componentClasses() {
					return [
						`field`,
						`type-${type}`,
						`name-${originalName}`,
						`nname-${name}`,
						`qname-${qualifiedName.replace(/\./g, "_")}`,
						this.required ? 'mandatory' : 'optional',
						this.pristine ? 'pristine' : 'touched',
						this.label ? 'with-label' : 'without-label',
						this.valid ? 'valid' : 'invalid'
					].concat(classes)
				}
			},
			template: `
<div v-if="required || visible" :class="componentClasses">
	<span class="label">
		<label>{{label}}<span v-if="required" class="mandatory">*</span></label>
	</span>
	<span class="widget">
		<FieldComponent ref="fieldComponent" />
		<span class="hint" v-if="hint && hint.length">{{ hint }}</span>
		<span class="errors" v-if="errors.length">
			<span class="error" v-for="error in errors">{{ localize( error ) }}</span>
		</span>
	</span>
</div>
			`,
			data: () => reactiveFieldInfo,
			methods: {
				localize(lookup) {
					if (Array.isArray(lookup)) {
						const [_lookup, args] = lookup;

						return L10n.translate(this.$store.getters.l10n, _lookup, ...args);
					}

					if (typeof lookup === "string") {
						const _lookup = lookup.trim();

						if (_lookup[0] === "@") {
							return L10n.translate(this.$store.getters.l10n, _lookup.slice(1));
						}
					}

					return lookup;
				}
			},
			created() {
				this.__onGlobalFormAutoFocusEvent = () => {
					if (that.form.autoFocusField === that) {
						this.$nextTick(() => {
							const firstControl = this.$el.querySelector("input, select, button");

							if (firstControl) {
								firstControl.focus();

								if (typeof firstControl.select === "function") {
									firstControl.select();
								}
							}
						});
					}
				};

				EventBus.$on("form:autofocus", this.__onGlobalFormAutoFocusEvent);
			},
			beforeMount() {
				if (that.pristine) {
					reactiveFieldInfo.value = that.normalizeValue(that.initial);
				}

				this.$on("input", () => {
					if (!this.pristine) {
						this.valid = null;
						const valid = that.valid; // eslint-disable-line no-unused-vars
					}
				});

				this.__onGlobalFormUpdateEvent = (emittingQualifiedName, updatedFieldName, newValue) => { // eslint-disable-line no-unused-vars
					if (emittingQualifiedName === qualifiedName) {
						const field = this.$refs.fieldComponent;
						if (field) {
							const fieldUpdater = field.updateOnDataChanged;
							if (typeof fieldUpdater === "function") {
								fieldUpdater();
							}
						}
					}
				};

				EventBus.$on("form:update", this.__onGlobalFormUpdateEvent);
			},
			beforeDestroy() {
				EventBus.$off("form:update", this.__onGlobalFormUpdateEvent);
				EventBus.$off("form:autofocus", this.__onGlobalFormAutoFocusEvent);
			},
		};
	}

	/**
	 * Normalizes provided input value in compliance with current type of field.
	 *
	 * @param {*} value some input value or similar
	 * @param {object} options additional options
	 * @returns {*} normalized value
	 */
	normalizeValue(value, options = {}) { // eslint-disable-line no-unused-vars
		return value;
	}

	/**
	 * Validates current state of field.
	 *
	 * @note This method is automatically invoked on updating this field's data.
	 *       As a result the properties `valid` and `errors` are updated. You
	 *       basically should rely on those properties instead of invoking this
	 *       method (explicitly again).
	 *
	 * @param {boolean} live indicates whether validation occurs live while user is providing input
	 * @returns {string[]} lists validation error messages, empty list indicates valid field
	 */
	validate(live = false) { // eslint-disable-line no-unused-vars
		const errors = [];
		const {value, required} = this;

		if (required && (value == null || value === "")) {
			errors.push("@VALIDATION.MISSING_REQUIRED");
		}

		return errors;
	}

	/**
	 * Sets up provided constructor function to represent "sub-class" of current
	 * one.
	 *
	 * @note This method is provided to simplify pre-ES6 inheritance on
	 *       registering custom types of fields.
	 *
	 * @param {function} subClassConstructor constructor function
	 * @returns {function} provided constructor function
	 */
	static makeInherit(subClassConstructor) {
		const subProto = subClassConstructor.prototype = Object.create(this.prototype);
		subProto.constructor = subClassConstructor;
		subProto.$super = this;

		return subClassConstructor;
	}

	/**
	 * Indicates if current class is a base class of provided one.
	 *
	 * @param {function|class} subClass some class to be tested for inheriting from current one
	 * @returns {boolean} true if current one is base class of provided one
	 */
	static isBaseClassOf(subClass) {
		let iter = subClass.prototype;

		while (iter) {
			if (iter.constructor === this) {
				return true;
			}

			iter = Object.getPrototypeOf(iter);
		}

		return false;
	}
}

/**
 * Converts provided arbitrary value of a definition to type expected for named
 * definition property.
 *
 * @param {string} name name of definition property provided value is associated with
 * @param {*} value some arbitrary value
 * @returns {*} normalized value for use with named definition property
 */
function normalizeDefinitionValue(name, value) {
	switch (name) {
		case "classes":
			return (typeof value === "string") ? value.trim().split(/\s*[,;]\s*/) : value;
		case "label" :
		case "hint" :
			return String(value);

		case "required" :
		case "visible" :
			switch (typeof value) {
				case "string" : {
					const boolean = Data.normalizeToBoolean(value);
					return boolean == null ? value.trim().length > 0 : boolean;
				}

				default :
					return Boolean(value);
			}

		default :
			return value;
	}
}
