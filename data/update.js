(() => {
	const fs = require('fs');
	const parse = require('csv-parse/lib/sync');
	const dataPaths = {
		csv: __dirname + "/data.csv",
		json: __dirname + "/data.json"
	}
	const dimensionsPaths = {
		csv: __dirname + "/dimensions.csv",
		json: __dirname + "/dimensions.json"
	}
	console.log(`{"INFO": "Starting data extraction for fh-simulator"}`);
	const CompoundsArray = parse(fs.readFileSync(dataPaths.csv), {
		columns: true,
		skip_empty_lines: true,
		cast: true,
		trim: true
	})
	fs.writeFileSync(dataPaths.json, JSON.stringify(CompoundsArray, null, 2))
	console.log(`{"INFO": "JSON file successfully updated"}`);

	const Dimensions = parse(fs.readFileSync(dimensionsPaths.csv), {
		columns: true,
		skip_empty_lines: true,
		cast: true,
		trim: true,
		relax_column_count: true
	})
	
	fs.writeFileSync(dimensionsPaths.json, JSON.stringify(Dimensions, null, 2))
})();