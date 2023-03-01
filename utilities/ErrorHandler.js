const themes = require("./themes");
exports.logError = async (errorObject) => {
  console.log(
    themes.error(
      JSON.stringify(
        {
          message: errorObject.message,
          ...(errorObject.error && { error: errorObject.error.toString() })
        },
        null,
        2
      )
    )
  );
};
