/**
 * Adapted from https://github.com/SnaveSutit/blockbench-plugin-template
 */

import * as PACKAGE from '../../package.json';
import { Subscribable } from './subscribable';

export class PluginEvent<EventData = void> extends Subscribable<EventData> {
	protected static events: Record<string, PluginEvent<any>> = {};
	constructor(public name: string) {
		super();
		PluginEvent.events[name] = this;
	}
}

// Plugin Events
export const events = {
	LOAD: new PluginEvent('load'),
	UNLOAD: new PluginEvent('unload'),
	INSTALL: new PluginEvent('install'),
	UNINSTALL: new PluginEvent('uninstall'),

	INJECT_MODS: new PluginEvent('injectMods'),
	EXTRACT_MODS: new PluginEvent('extractMods'),

	SELECT_PROJECT: new PluginEvent<ModelProject>('selectProject'),
	UNSELECT_PROJECT: new PluginEvent<ModelProject>('deselectProject'),
	
	LOAD_PROJECT: new PluginEvent<ModelProject>('loadProject')
};

function injectionHandler() {
	console.groupCollapsed(`Injecting BlockbenchMods added by '${PACKAGE.name}'`);
	events.INJECT_MODS.dispatch();
	console.groupEnd();
}

function extractionHandler() {
	console.groupCollapsed(`Extracting BlockbenchMods added by '${PACKAGE.name}'`);
	events.EXTRACT_MODS.dispatch();
	console.groupEnd();
}

events.LOAD.subscribe(injectionHandler);
events.UNLOAD.subscribe(extractionHandler);
events.INSTALL.subscribe(injectionHandler);
events.UNINSTALL.subscribe(extractionHandler);

Blockbench.on<EventName>('select_project', ({ project }: { project: ModelProject }) => {
	events.SELECT_PROJECT.dispatch(project);
});
Blockbench.on<EventName>('unselect_project', ({ project }: { project: ModelProject }) => {
	events.UNSELECT_PROJECT.dispatch(project);
});


Blockbench.on<EventName>('load_project', ({ project }: { project: ModelProject }) => {
	events.LOAD_PROJECT.dispatch(project);
});
