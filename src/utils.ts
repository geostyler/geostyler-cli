const parseOption = (value: string): boolean | number | string | undefined => {
  const asNumber = Number(value);
  if (!isNaN(asNumber)) {
    return asNumber;
  }
  const isTrue = value.toLowerCase() === 'true';
  if (isTrue) {
    return true;
  }
  const isFalse = value.toLowerCase() === 'false';
  if (isFalse) {
    return false;
  }
  return value;
};

/**
 * Parses the option string into a (flat) object and parse boolean (false/true) and numeric values.
 * Expected input "key1:value1,key2:value2"
 */
export const getParserOptions = (optionsAsString: string): Record<string, unknown> => {
  if (!optionsAsString) {
    return {};
  }
  const options = optionsAsString.split(',');
  const optionsObject: Record<string, unknown> = {};
  options.forEach((option) => {
    const splitOption = option.split(':');
    if (splitOption.length === 2) {
      const optionName = splitOption[0].trim();
      const optionValue = splitOption[1].trim();
      optionsObject[optionName] = parseOption(optionValue);
    }
  });
  return optionsObject;
};
