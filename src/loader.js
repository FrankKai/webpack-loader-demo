export default function loader(source) {
  const options = this.getOptions();

  console.log("loader before:", source);

  source = source.replace(/\[name\]/g, options.name);

  console.log("loader after:", source);

  return `export default ${JSON.stringify(source)}`;
}