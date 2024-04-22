import { loadDependencies } from "@/main";
import { CircleAlertIcon, CrossIcon } from "lucide-react";
import { Notice, debounce, parseYaml } from "obsidian";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

const RequiedDepsError = () => (
	<>
		<h3>Failed to load dependencies!</h3>
		<div>
			Plugins required:
			<ul>
				<li>
					<a href="https://github.com/blacksmithgu/obsidian-dataview">
						Dataview
					</a>
				</li>
				<li>
					<a href="https://github.com/chhoumann/MetaEdit">MetaEdit</a>
				</li>
			</ul>
		</div>
	</>
);

const InvalidConfigError = () => (
	<>
		<h3>Invalid config!</h3>
		<div>Your config is not valid :(</div>
	</>
);

const ConfigSchema = z.object({
	id: z.union([z.string(), z.number()]),
	title: z.union([z.string(), z.number()]),
	description: z.union([z.string(), z.number()]).optional(),
	dv: z.string().optional(),
	dvjs: z.string().optional(),
	property: z.union([z.string(), z.number()]),
	columns: z.array(z.union([z.string(), z.array(z.string())])),
	className: z.string().optional(),
});

const validateConfig = (config: any) => {
	try {
		ConfigSchema.parse(config);
		return true;
	} catch (e) {
		console.log("invalid schema", e);
		return false;
	}
};

const App = (props: any) => {
	const { data, getSectionInfo, settings, plugin } = props;
	// console.log(props);
	const [ErrMsg, setErrMsg] = useState<() => React.JSX.Element>(undefined);

	const [, updateEmpty] = useState({});
	const forceUpdate = useCallback(() => updateEmpty({}), []);
	plugin.registerEvent(
		plugin.app.metadataCache.on("dataview:index-ready", () => {
			console.log("index ready");
			forceUpdate();
		}),
	);
	plugin.registerEvent(
		plugin.app.metadataCache.on("dataview:metadata-change", () => {
			console.log("metadata changed");
			forceUpdate();
		}),
	);

	const config: z.infer<typeof ConfigSchema> = parseYaml(data);
	const { id, title, description, dv, dvjs, property, columns, className } =
		config;
	//console.log("config", config);

	useEffect(() => {
		new Notice("App rendered");
		(async () => {
			const b = await loadDependencies();
			if (!b) return setErrMsg(() => RequiedDepsError);

			const isValidConfig = validateConfig(config);
			if (!isValidConfig) {
				return setErrMsg(() => InvalidConfigError);
			}
		})();

		plugin.addCommand({
			id: `reload-meta-kanban`,
			name: `Reload Meta Kanban`,
			callback: () => forceUpdate(),
		});
	}, []);

	if (ErrMsg) {
		return (
			<div id="twcss">
				<div className="rounded-md border-dashed border-[var(--text-error)] p-4">
					<h2 className="mt-0 flex items-center justify-start gap-2">
						<CircleAlertIcon color="var(--text-error)" size={25} />
						Error
					</h2>
					<ErrMsg />
				</div>
			</div>
		);
	}

	return (
		<div id="twcss">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h2 className="m-0">{title}</h2>
					<i>{description}</i>
				</div>
				<EditableTable
					key={new Date().toLocaleTimeString("en-US")}
					id={id}
					config={config}
				/>
			</div>
		</div>
	);
};

export default App;

const EditableTable = ({
	id,
	config,
}: {
	id: string | number;
	config: z.infer<typeof ConfigSchema>;
}) => {
	const [queryResults, setQueryResults] = useState<any>();
	// @ts-ignore
	const meApi = app.plugins.plugins.metaedit.api;

	const doQuery = async () => {
		// @ts-ignore
		const dvApi = app.plugins.plugins.dataview.api;
		const qr = await dvApi.query(config.dv);
		if (!qr.successful) {
			return;
		}
		setQueryResults(qr.value);
	};

	// @ts-ignore
	app.metadataCache.on("dataview:index-ready", async () => {
		await doQuery();
	});
	// @ts-ignore
	app.metadataCache.on("dataview:metadata-change", async () => {
		await doQuery();
	});

	const updateMetaData = debounce(
		(k: number, e: React.ChangeEvent<HTMLInputElement>, v: any[]) => {
			console.log("updated?");
			meApi.update(queryResults.headers[k], e.target.value, v[0]?.path);
		},
		1500,
		true,
	);

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return;

	return (
		<table className={config.className}>
			<thead>
				<tr>
					{queryResults.headers.map((h) => (
						<th key={id + h}>{h}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{queryResults.values.map((v, i) => (
					<tr key={id + i + "table-row"}>
						{v.map((d, k) => (
							<td key={id + i + d.path ?? d + k}>
								{d.path ? (
									<a
										href="d.path"
										data-tooltip-position="top"
										aria-label={d.path}
										data-href={d.path}
										className={"internal-link"}
										target="_blank"
										rel="noopener"
									>
										{d.path}
									</a>
								) : (
									<input
										defaultValue={d}
										onChange={(e) => {
											console.log("changed");
											updateMetaData(k, e, v);
										}}
										className="m-0 w-full border-transparent bg-transparent p-0 text-start"
									/>
								)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
