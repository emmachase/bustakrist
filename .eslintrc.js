module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
  },
  "extends": [
    "plugin:react/recommended",
    "google",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
    },
    "ecmaVersion": 12,
    "sourceType": "module",
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "eslint-plugin-jsdoc",
  ],
  "rules": {
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "no-multi-spaces": "off",
    "operator-linebreak": "off",
    "object-curly-spacing": ["error", "always"],
    "no-unused-vars": "warn",
    "curly": "off",

    "react/prop-types": "off",

    "@typescript-eslint/explicit-member-accessibility": ["error", {
      accessibility: "explicit",
    }],

    "react/react-in-jsx-scope": "off", // Not necessary as of React 17

    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "jsdoc/check-access": 1,
    "jsdoc/check-alignment": 1,
    "jsdoc/check-param-names": 1,
    "jsdoc/check-property-names": 1,
    "jsdoc/check-tag-names": 1,
    "jsdoc/check-types": 1,
    "jsdoc/check-values": 1,
    "jsdoc/empty-tags": 1,
    "jsdoc/implements-on-classes": 1,
    "jsdoc/newline-after-description": 1,
    "jsdoc/no-undefined-types": 1,
    "jsdoc/require-hyphen-before-param-description": 1,
    "jsdoc/require-jsdoc": [1, {
      publicOnly: true,
      contexts: [
        "ArrowFunctionExpression",
        "ClassDeclaration",
        "ClassExpression",
        "FunctionDeclaration",
        "FunctionExpression",
      ],
    }],
    "jsdoc/require-param": 1,
    "jsdoc/require-param-description": 1,
    "jsdoc/require-param-name": 1,
    "jsdoc/require-param-type": 1,
    "jsdoc/require-property": 1,
    "jsdoc/require-property-description": 1,
    "jsdoc/require-property-name": 1,
    "jsdoc/require-property-type": 1,
    "jsdoc/require-returns-check": 1,
    "jsdoc/require-returns-description": 1,
    "jsdoc/require-returns-type": 1,
    "jsdoc/require-yields": 1,
    "jsdoc/valid-types": 1,
  },
};
