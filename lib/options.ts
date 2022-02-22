const optionator = require("optionator");

export default optionator({
  prepend: "metalint [options] file.meta [file.meta] [dir]",
  options: [
    {
      heading: "Basic configuration"
    },
    {
      heading: "Fixing problems"
    },
    {
      option: "fix",
      type: "Boolean",
      default: false,
      description: "Automatically fix problems"
    },
    {
      heading: "Miscellaneous"
    },
    {
      option: "env-info",
      type: "Boolean",
      default: "false",
      description: "Output execution environment information"
    },
    {
      option: "help",
      alias: "h",
      type: "Boolean",
      description: "Show help"
    },
    {
      option: "version",
      alias: "v",
      type: "Boolean",
      description: "Output the version number"
    },
  ],
});
