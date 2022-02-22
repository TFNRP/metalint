import Ajv from 'ajv';
import metaSchema from 'ajv/lib/refs/json-schema-draft-04.json';

export default (additionalOptions = {}) => {
  const ajv = new Ajv({
    meta: false,
    useDefaults: true,
    validateSchema: false,
    missingRefs: "ignore",
    verbose: true,
    schemaId: "auto",
    ...additionalOptions
  });

  ajv.addMetaSchema(metaSchema);
  // @ts-expect-error
  // eslint-disable-next-line no-underscore-dangle -- Ajv's API
  ajv._opts.defaultMeta = metaSchema.id;

  return ajv;
};
